"""
Draw the 1200x630 link-preview images: the site's "business card" and one card
per project page. Run by scripts/build_previews.mjs, which sends a JSON job on
stdin and reads {key: public url} from stdout.

Photo previews are made separately by process_photos.py.
"""

import hashlib
import io
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  python -m pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path(__file__).resolve().parent / "fonts"

W, H = 1200, 630
S = 2  # draw at double size, then shrink, for smooth edges

# Same palette as src/index.css
BG = "#070b1a"
BG_2 = "#0d1430"
SURFACE = "#111a3a"
BORDER = "#1f2b57"
TEXT = "#e8ecf8"
MUTED = "#8d97b8"
BLUE = "#3b82f6"
BLUE_2 = "#60a5fa"
RED = "#ef4444"
RED_2 = "#fb7185"
AMBER = "#f59e0b"
GREEN = "#22c55e"

WIN = (50, 36, 1150, 594)
BAR_H = 66


def font(name, size, weight):
    f = ImageFont.truetype(str(FONTS / name), size * S)
    f.set_variation_by_axes([weight])
    return f


def sans(size, weight=500):
    return font("SpaceGrotesk.ttf", size, weight)


def mono(size, weight=400):
    return font("JetBrainsMono.ttf", size, weight)


def rgb(color):
    return tuple(int(color[i : i + 2], 16) for i in (1, 3, 5))


def scaled(box):
    return tuple(v * S for v in box)


def text_width(d, text, f):
    return d.textlength(text, font=f) / S


def put(d, x, y, text, f, fill, anchor="la"):
    d.text((x * S, y * S), text, font=f, fill=fill, anchor=anchor)


def wrap(d, text, f, width, max_lines):
    words, lines, line = text.split(), [], ""
    for i, word in enumerate(words):
        trial = f"{line} {word}".strip()
        if text_width(d, trial, f) <= width:
            line = trial
            continue
        lines.append(line)
        line = word
        if len(lines) == max_lines:
            rest = lines[-1]
            while rest and text_width(d, rest.rstrip(" ,.;:-—") + "…", f) > width:
                rest = rest.rsplit(" ", 1)[0] if " " in rest else rest[:-1]
            lines[-1] = rest.rstrip(" ,.;:-—") + "…"
            return lines
    if line:
        lines.append(line)
    return lines


def gradient_text(img, cx, y, text, f):
    """Centered text filled with the site's blue-to-red gradient."""
    d = ImageDraw.Draw(img)
    box = d.textbbox((cx * S, y * S), text, font=f, anchor="ma")
    left, top, right, bottom = (int(v) for v in box)
    right, bottom = right + 1, bottom + 1
    width = right - left
    stops = [rgb(BLUE_2), rgb(BLUE), rgb(RED_2), rgb(RED)]
    ramp = Image.new("RGB", (width, 1))
    for x in range(width):
        t = x / max(width - 1, 1) * (len(stops) - 1)
        i = min(int(t), len(stops) - 2)
        k = t - i
        ramp.putpixel((x, 0), tuple(round(a + (b - a) * k) for a, b in zip(stops[i], stops[i + 1])))
    fill = ramp.resize((width, bottom - top))
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).text((cx * S, y * S), text, font=f, fill=255, anchor="ma")
    img.paste(fill, (left, top), mask.crop((left, top, right, bottom)))


def window(url):
    """Background, glow, and the browser-style window from the status section."""
    img = Image.new("RGB", (W * S, H * S), BG)
    glow = Image.new("RGB", (W // 4, H // 4), BG)
    g = ImageDraw.Draw(glow)
    g.ellipse((-50, -60, 110, 90), fill=rgb(BLUE))
    g.ellipse((200, 80, 360, 220), fill=rgb(RED))
    glow = glow.filter(ImageFilter.GaussianBlur(34)).resize(img.size, Image.BICUBIC)
    img = Image.blend(img, glow, 0.38)

    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = WIN
    d.rounded_rectangle(scaled(WIN), radius=22 * S, fill=BG_2, outline=BORDER, width=2 * S)

    bar = Image.new("L", img.size, 0)
    ImageDraw.Draw(bar).rounded_rectangle(scaled((x0 + 1, y0 + 1, x1 - 1, y1 - 1)), radius=21 * S, fill=255)
    ImageDraw.Draw(bar).rectangle(scaled((x0, y0 + BAR_H, x1, y1)), fill=0)
    img.paste(Image.new("RGB", img.size, SURFACE), (0, 0), bar)
    d.line(scaled((x0, y0 + BAR_H, x1, y0 + BAR_H)), fill=BORDER, width=2 * S)

    cy = y0 + BAR_H / 2
    for i, color in enumerate((RED, AMBER, GREEN)):
        cx = x0 + 34 + i * 26
        d.ellipse(scaled((cx - 8, cy - 8, cx + 8, cy + 8)), fill=color)
    d.rounded_rectangle(scaled((x0 + 124, cy - 19, x1 - 34, cy + 19)), radius=9 * S, fill=BG)
    put(d, (x0 + 124 + x1 - 34) / 2, cy, url, mono(19), MUTED, "mm")
    return img, d


def business_card(c):
    img, d = window(f"{c['host']}/status")
    cx = W / 2
    gradient_text(img, cx, 122, c["name"], sans(88, 700))
    put(d, cx, 228, c["role"], sans(29), TEXT, "ma")
    d.line(scaled((cx - 44, 287, cx + 44, 287)), fill=BORDER, width=2 * S)
    put(d, cx, 310, "Currently", mono(23), MUTED, "ma")
    put(d, cx, 342, c["status"], sans(70, 700), BLUE_2 if c["open"] else RED, "ma")
    put(d, cx, 456, c["coordinates"], mono(25), MUTED, "ma")
    put(d, cx, 494, c["location"], mono(25), MUTED, "ma")
    return img


def project_card(p, host):
    img, d = window(f"{host}{p['path']}")
    left, text_x = 96, 96
    source = ROOT / "public" / p["image"].lstrip("/") if p.get("image") else None
    if source and source.is_file():
        size = 372
        with Image.open(source) as im:
            art = ImageOps.fit(im.convert("RGB"), (size * S, size * S), Image.LANCZOS)
        mask = Image.new("L", art.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, art.width - 1, art.height - 1), radius=18 * S, fill=255)
        img.paste(art, (left * S, 156 * S), mask)
        d.rounded_rectangle(scaled((left, 156, left + size, 156 + size)), radius=18 * S, outline=BORDER, width=2 * S)
        text_x = left + size + 48
    width = 1104 - text_x

    put(d, text_x, 150, p["kicker"], mono(21), BLUE_2)
    title_font = sans(52, 700)
    y = 188
    for line in wrap(d, p["title"], title_font, width, 2):
        put(d, text_x, y, line, title_font, TEXT)
        y += 60
    y += 12
    body_font = sans(26, 400)
    for line in wrap(d, p["description"], body_font, width, 5 if y < 270 else 4):
        put(d, text_x, y, line, body_font, MUTED)
        y += 36

    tag_font = mono(19)
    x, tag_y = text_x, 494
    for tag in p.get("tags", []):
        w = text_width(d, tag, tag_font) + 26
        if x + w > 1104:
            break
        d.rounded_rectangle(scaled((x, tag_y, x + w, tag_y + 36)), radius=18 * S, fill=SURFACE, outline=BORDER, width=S)
        put(d, x + w / 2, tag_y + 18, tag, tag_font, TEXT, "mm")
        x += w + 10
    return img


def save(img, out_dir, stem):
    """Save with a content hash in the name, so a changed card gets a new URL."""
    buf = io.BytesIO()
    img.resize((W, H), Image.LANCZOS).save(buf, "JPEG", quality=88, optimize=True, progressive=True)
    data = buf.getvalue()
    name = f"{stem}-{hashlib.sha256(data).hexdigest()[:10]}.jpg"
    (out_dir / name).write_bytes(data)
    return f"/share/{name}"


def main():
    job = json.load(sys.stdin.buffer)  # bytes, so Windows doesn't misread UTF-8
    out_dir = Path(job["out"])
    out_dir.mkdir(parents=True, exist_ok=True)
    urls = {"card": save(business_card(job["card"]), out_dir, "card")}
    for p in job["projects"]:
        urls[p["key"]] = save(project_card(p, job["card"]["host"]), out_dir, f"project-{p['slug']}")
    json.dump(urls, sys.stdout)


if __name__ == "__main__":
    main()
