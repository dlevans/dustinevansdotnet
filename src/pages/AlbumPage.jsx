import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { photography } from '../data/site'
import { Reveal } from '../components/Reveal'
import PhotoGrid from '../components/PhotoGrid'
import Link from '../components/Link'
import { iconFor } from '../icons'
import { navigate } from '../router'

export default function AlbumPage({ album, photoName }) {
  const { albums, instagram } = photography
  const albumPath = `/photography/${album.slug}`
  const i = albums.findIndex((a) => a.slug === album.slug)
  const prev = albums[(i - 1 + albums.length) % albums.length]
  const next = albums[(i + 1) % albums.length]

  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/photography" className="page__back mono">← all galleries</Link>
          <p className="mono kicker">photography</p>
          <h1 className="page__title">
            <span className="gradient-text">{album.title}</span>
          </h1>
          {album.description && <p className="section-lead">{album.description}</p>}
        </Reveal>

        {album.photos.length ? (
          <PhotoGrid
            photos={album.photos}
            activeName={photoName}
            onActiveChange={(name, options) => navigate(name ? `${albumPath}/${name}` : albumPath, options)}
          />
        ) : (
          <Reveal className="empty">
            <span className="empty__icon">{album.icon || '📷'}</span>
            <p>Photos coming soon.</p>
            {instagram && (
              <a className="btn btn--ghost" href={instagram} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={iconFor('instagram')} /> See my latest on Instagram
              </a>
            )}
          </Reveal>
        )}

        {albums.length > 1 && (
          <nav className="album-pager" aria-label="Other galleries">
            <Link to={`/photography/${prev.slug}`} className="album-pager__link">
              <span className="mono muted">← previous</span>
              <strong>{prev.title}</strong>
            </Link>
            <Link to={`/photography/${next.slug}`} className="album-pager__link album-pager__link--next">
              <span className="mono muted">next →</span>
              <strong>{next.title}</strong>
            </Link>
          </nav>
        )}
      </div>
    </section>
  )
}
