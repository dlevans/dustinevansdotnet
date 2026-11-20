import Link from './Link'
import { Reveal } from './Reveal'

const coverOf = (album) => album.cover || album.photos[0]?.thumb || album.photos[0]?.src || ''

export default function AlbumCard({ album, index }) {
  const cover = coverOf(album)
  const count = album.photos.length
  return (
    <Reveal className="album-wrap" delay={(index % 4) * 80}>
      <Link to={`/photography/${album.slug}`} className="album">
        <span className="album__cover" data-variant={index % 4}>
          {cover ? <img src={cover} alt="" loading="lazy" /> : <span className="album__icon">{album.icon || '📷'}</span>}
        </span>
        <span className="album__body">
          <strong>{album.title}</strong>
          <span className="mono">{count ? `${count} photo${count === 1 ? '' : 's'}` : 'coming soon'}</span>
        </span>
      </Link>
    </Reveal>
  )
}

export function AlbumGrid({ albums }) {
  return (
    <div className="albums">
      {albums.map((a, i) => (
        <AlbumCard key={a.slug} album={a} index={i} />
      ))}
    </div>
  )
}
