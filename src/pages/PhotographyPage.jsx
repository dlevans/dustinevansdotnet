import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { photography } from '../data/site'
import { Reveal } from '../components/Reveal'
import { AlbumGrid } from '../components/AlbumCard'
import Link from '../components/Link'
import { iconFor } from '../icons'

export default function PhotographyPage() {
  const { intro, albums, instagram } = photography

  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/" className="page__back mono">← back home</Link>
          <p className="mono kicker">gallery</p>
          <h1 className="page__title">
            <span className="gradient-text">Photography</span>
          </h1>
          {intro && <p className="section-lead">{intro}</p>}
        </Reveal>

        <AlbumGrid albums={albums} />

        {instagram && (
          <Reveal className="section-more">
            <a className="btn btn--ghost" href={instagram} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={iconFor('instagram')} /> More on Instagram
            </a>
          </Reveal>
        )}
      </div>
    </section>
  )
}
