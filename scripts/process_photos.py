"""
Turn camera originals into web-ready photos for the site.

    npm run photos

Reads   photos-originals/<Album Folder>/[<group>/]image.jpg
Writes  photos/<album-slug>/<name>.webp          (full size, long edge 2400px)
        photos/<album-slug>/thumbs/<name>.webp   (grid thumbnail, long edge 900px)
        photos/<album-slug>/share/<name>.jpg     (1200x630 link preview image)
        src/data/photos.generated.js             (list the site reads automatically)

Then uploads new/changed web copies to Cloudinary and puts their URLs in
photos.generated.js, so the deployed site needs no photo files of its own.
Cloudinary keys go in .env (see .env.example). Without them, the site uses
local /photos/... paths, which only work under `npm run dev`.

- Every folder in photos-originals becomes a gallery (e.g. "Night Sky" →
  /photography/night-sky). Folders with no images are left off the site.
  Folders starting with "_" or "." are ignored.
- Subfolders inside an album (e.g. people/caitlyn) become the photo's caption.
- Photos are sorted newest first by the date the photo was taken.
- Rotation from the camera is applied, and ALL metadata (GPS, camera info) is
  stripped from the web copies.
- Only new or changed photos are re-processed. Web copies whose original was
  deleted are removed.

Requires:  python -m pip install -r requirements.txt
"""

import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  python -m pip install Pillow")

Image.MAX_IMAGE_PIXELS = 300_000_000  # allow big panoramas

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "photos-originals"
OUT = ROOT / "photos"
DATA = ROOT / "src" / "data" / "photos.generated.js"
MANIFEST = OUT / ".cloudinary.json"  # what's already on Cloudinary (local only)

FULL_EDGE = 2400
THUMB_EDGE = 900
FULL_QUALITY = 82
THUMB_QUALITY = 76
SHARE_SIZE = (1200, 630)
SHARE_QUALITY = 84
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}


def slugify(text):
    text = re.sub(r"\s+copy(\s*\d+)?$", "", text, flags=re.I)  # "DSC00281 copy 2" -> "DSC00281"
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "photo"


def folder_slug(name):
    return re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower() or "album"


def taken_date(im, path):
    try:
        exif = im.getexif()
        raw = exif.get_ifd(0x8769).get(36867) or exif.get(306)
        if raw:
            return datetime.strptime(str(raw).strip()[:19], "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    return datetime.fromtimestamp(path.stat().st_mtime)


def save_resized(im, dest, edge, quality):
    copy = im.copy()
    copy.thumbnail((edge, edge), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    copy.save(dest, "WEBP", quality=quality, method=6)  # no exif= → metadata stripped
    return copy.size


def save_share(im, dest):
    """Link preview: the whole photo, uncropped, over a dark blurred copy of itself."""
    photo = im.convert("RGB")
    photo.thumbnail((FULL_EDGE, FULL_EDGE), Image.LANCZOS)
    back = ImageOps.fit(photo, SHARE_SIZE, Image.BILINEAR).filter(ImageFilter.GaussianBlur(40))
    back = Image.blend(back, Image.new("RGB", SHARE_SIZE, "#070b1a"), 0.6)
    photo.thumbnail(SHARE_SIZE, Image.LANCZOS)
    back.paste(photo, ((SHARE_SIZE[0] - photo.width) // 2, (SHARE_SIZE[1] - photo.height) // 2))
    dest.parent.mkdir(parents=True, exist_ok=True)
    back.save(dest, "JPEG", quality=SHARE_QUALITY, optimize=True, progressive=True)  # no metadata


def load_env():
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text(encoding="utf8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def cloudinary_client():
    """Configured cloudinary module, or None if no keys are set."""
    load_env()
    url = os.environ.get("CLOUDINARY_URL")
    name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    key = os.environ.get("CLOUDINARY_API_KEY")
    secret = os.environ.get("CLOUDINARY_API_SECRET")
    if not url and not (name and key and secret):
        return None
    try:
        import cloudinary
        import cloudinary.uploader
    except ImportError:
        print("Cloudinary keys found but the SDK isn't installed. Run:  python -m pip install -r requirements.txt")
        return None
    if url:
        cloudinary.config(cloudinary_url=url, secure=True)
    else:
        cloudinary.config(cloud_name=name, api_key=key, api_secret=secret, secure=True)
    return cloudinary


def sync_cloudinary(local_urls):
    """Upload new/changed files, delete removed ones. Returns {local url: cloudinary url}."""
    manifest = {}
    if MANIFEST.exists():
        try:
            manifest = json.loads(MANIFEST.read_text(encoding="utf8"))
        except Exception:
            manifest = {}

    def stamp(path):
        st = path.stat()
        return f"{st.st_size}:{st.st_mtime_ns}"

    files = {u: OUT / u[len("/photos/"):] for u in local_urls}
    up_to_date = {u: manifest[u]["url"] for u, f in files.items()
                  if u in manifest and manifest[u].get("stamp") == stamp(f)}

    cloud = cloudinary_client()
    if cloud is None:
        if len(up_to_date) < len(files):
            print(f"\nNot uploading {len(files) - len(up_to_date)} files: no Cloudinary keys in .env (see .env.example).")
        return up_to_date

    folder = os.environ.get("CLOUDINARY_FOLDER", "dustinevansdotnet").strip("/")

    def upload(item):
        local_url, path = item
        rel = local_url[len("/photos/"):].rsplit(".", 1)[0]  # outdoors/thumbs/streetcar
        public_id = f"{folder}/{rel}"
        try:
            res = cloud.uploader.upload(
                str(path),
                public_id=public_id,
                asset_folder=f"{folder}/{rel.rsplit('/', 1)[0]}",
                resource_type="image",
                overwrite=True,
                invalidate=True,
            )
        except Exception as e:
            print(f"  ✗ upload failed: {rel}  ({e})")
            return local_url, None
        print(f"  ↑ {rel}")
        return local_url, {"url": res["secure_url"], "public_id": res["public_id"], "stamp": stamp(path)}

    todo = [(u, f) for u, f in files.items() if u not in up_to_date]
    failed = 0
    if todo:
        print(f"\nUploading {len(todo)} files to Cloudinary ({folder}/)…")
        with ThreadPoolExecutor(max_workers=6) as pool:
            for local_url, entry in pool.map(upload, todo):
                if entry:
                    manifest[local_url] = entry
                else:
                    failed += 1

    gone = [u for u in manifest if u not in files]
    for u in gone:
        try:
            cloud.uploader.destroy(manifest[u]["public_id"], resource_type="image", invalidate=True)
            print(f"  ✗ removed from Cloudinary: {u}")
            del manifest[u]
        except Exception as e:
            print(f"  ! couldn't delete {u} from Cloudinary ({e})")

    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=1), encoding="utf8")
    if failed:
        print(f"Warning: {failed} uploads failed; those photos use local paths until the next run.")
    return {u: manifest[u]["url"] for u in files if u in manifest}


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles
    except Exception:
        pass
    if not SRC.exists():
        # Originals only live on the dev machine (they're gitignored), so on a
        # build server keep the committed photos.generated.js as-is.
        print(f"No {SRC.name}/ folder here; skipping photo processing.")
        return

    old = []
    if DATA.exists():
        try:
            text = DATA.read_text(encoding="utf8")
            old = json.loads(text.split("export default", 1)[1].strip())
        except Exception:
            old = []
    old_lists = [a["photos"] for a in old] if isinstance(old, list) else list(old.values())
    old_by_key = {(a["slug"], p["name"]): p for a in (old if isinstance(old, list) else []) for p in a["photos"]}

    result, keep = [], set()
    made = skipped = 0
    empty = []

    folders = sorted(p for p in SRC.iterdir() if p.is_dir() and not p.name.startswith(("_", ".")))
    for album_dir in folders:
        album = folder_slug(album_dir.name)
        entries, used = [], set()
        files = sorted(f for f in album_dir.rglob("*") if f.is_file() and f.suffix.lower() in EXTS)
        for f in files:
            rel = f.relative_to(album_dir)
            group = rel.parts[0] if len(rel.parts) > 1 else ""
            base = slugify(f"{group}-{f.stem}" if group else f.stem)
            name, n = base, 2
            while name in used:
                name, n = f"{base}-{n}", n + 1
            used.add(name)

            full = OUT / album / f"{name}.webp"
            thumb = OUT / album / "thumbs" / f"{name}.webp"
            share = OUT / album / "share" / f"{name}.jpg"
            local = {
                "src": f"/photos/{album}/{name}.webp",
                "thumb": f"/photos/{album}/thumbs/{name}.webp",
                "share": f"/photos/{album}/share/{name}.jpg",
            }
            keep.update({full.resolve(), thumb.resolve(), share.resolve()})

            prev = old_by_key.get((album, name))
            fresh = (
                prev
                and full.exists()
                and thumb.exists()
                and share.exists()
                and full.stat().st_mtime >= f.stat().st_mtime
            )
            if fresh:
                entries.append({**prev, "local": local})
                skipped += 1
                continue

            with Image.open(f) as im:
                date = taken_date(im, f)
                im = ImageOps.exif_transpose(im)
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGB")
                w, h = save_resized(im, full, FULL_EDGE, FULL_QUALITY)
                save_resized(im, thumb, THUMB_EDGE, THUMB_QUALITY)
                save_share(im, share)
            made += 1
            print(f"  ✓ {album}/{name}  ({w}x{h})")
            entries.append({
                "name": name,
                "local": local,
                "ratio": f"{w} / {h}",
                "group": group,
                "date": date.strftime("%Y-%m-%d"),
            })

        entries.sort(key=lambda e: e["date"], reverse=True)
        if entries:
            result.append({"slug": album, "folder": album_dir.name, "photos": entries})
        else:
            empty.append(album_dir.name)

    # remove web copies whose original is gone
    removed = 0
    if OUT.exists():
        for f in [*OUT.rglob("*.webp"), *OUT.glob("*/share/*.jpg")]:
            if f.resolve() not in keep:
                f.unlink()
                removed += 1
        # tidy up folders left empty (deepest first)
        for d in sorted((d for d in OUT.rglob("*") if d.is_dir()), key=lambda d: len(d.parts), reverse=True):
            if not any(d.iterdir()):
                d.rmdir()

    # point the site at Cloudinary (or local paths for anything not uploaded)
    local_urls = [u for a in result for p in a["photos"] for u in p["local"].values()]
    hosted = sync_cloudinary(local_urls)
    for a in result:
        for i, p in enumerate(a["photos"]):
            local = p.pop("local")
            urls = {k: hosted.get(v, v) for k, v in local.items()}
            rest = {k: v for k, v in p.items() if k not in ("name", "src", "thumb", "share")}
            a["photos"][i] = {"name": p["name"], **urls, **rest}

    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(
        "// AUTO-GENERATED by `npm run photos` (scripts/process_photos.py). Do not edit by hand.\n"
        "// To add captions, alt text, or mark favorites, use `photoDetails` in site.js.\n"
        "export default " + json.dumps(result, indent=2, ensure_ascii=False) + "\n",
        encoding="utf8",
    )

    total = sum(len(a["photos"]) for a in result)
    size = sum(f.stat().st_size for f in OUT.rglob("*.webp")) if OUT.exists() else 0
    print(f"\nDone: {made} processed, {skipped} unchanged, {removed} removed — {total} photos, {size / 1e6:.1f} MB in photos/")
    for a in result:
        print(f"  {a['folder']:20s} {len(a['photos']):3d}  →  /photography/{a['slug']}")
    for name in empty:
        print(f"  {name:20s}   0  (hidden — no images)")


if __name__ == "__main__":
    main()
