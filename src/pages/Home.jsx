import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { profile, about, projects, experience, socials, photography, allPhotos } from '../data/site'
import { Reveal, SectionTitle } from '../components/Reveal'
import { ProjectGrid } from '../components/ProjectCard'
import PhotoGrid from '../components/PhotoGrid'
import { AlbumGrid } from '../components/AlbumCard'
import Link from '../components/Link'
import FlipWords from '../fx/FlipWords'
import { iconFor } from '../icons'
import { confettiCannons } from '../fx/celebrate'

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__glow hero__glow--blue" />
      <div className="hero__glow hero__glow--red" />
      <div className="container">
        <p className="hero__greeting mono">
          <span className="wave">👋</span> {profile.greeting}, I'm
        </p>
        <h1 className="hero__name">
          <span className="gradient-text">{profile.firstName}</span>{' '}
          <span className="outline-text">{profile.lastName}</span>
        </h1>
        <p className="hero__roles">
          {profile.roleLines.map((line, i) => (
            <span key={i} className={i % 2 === 0 ? 'strong' : ''}>
              {line}{' '}
            </span>
          ))}
        </p>
        <p className="hero__loves">
          and I <span className="heart">❤</span> <FlipWords words={profile.loves} />
        </p>
        <p className="hero__tagline">{profile.tagline}</p>
        <div className="hero__cta">
          <a className="btn" href="#projects">See my work</a>
          <a className="btn btn--ghost" href="#contact">Get in touch</a>
        </div>
      </div>
      <a href="#about" className="hero__scroll mono" aria-label="Scroll down">
        scroll ↓
      </a>
    </section>
  )
}

function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionTitle kicker="01 — about" title="A little about me" />
        <div className="about">
          <Reveal className="about__text">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
          <Reveal className="about__skills" delay={120}>
            <h3 className="mono">// toolkit</h3>
            <ul>
              {about.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured)
  const items = (featured.length ? featured : projects).slice(0, 6)
  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionTitle kicker="02 — work" title="A collection of my crafts" />
        <ProjectGrid items={items} />
        {projects.length > items.length && (
          <Reveal className="section-more">
            <Link to="/projects" className="btn btn--ghost">
              View all {projects.length} projects →
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function Photography() {
  const { intro, albums, homeCount = 8, instagram } = photography
  if (!albums.length) return null
  // Show featured photos if there are any, otherwise the album covers
  const featured = allPhotos.filter((p) => p.featured).slice(0, homeCount)
  return (
    <section className="section" id="photography">
      <div className="container">
        <SectionTitle kicker="03 — photography" title="Through my lens">
          {intro && <p className="section-lead">{intro}</p>}
        </SectionTitle>
        <Reveal>
          {featured.length ? <PhotoGrid photos={featured} /> : <AlbumGrid albums={albums} />}
        </Reveal>
        <Reveal className="section-more">
          <Link to="/photography" className="btn btn--ghost">
            View all galleries →
          </Link>
          {instagram && (
            <a className="btn btn--ghost" href={instagram} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={iconFor('instagram')} /> More on Instagram
            </a>
          )}
        </Reveal>
      </div>
    </section>
  )
}

function Experience() {
  if (!experience.length) return null
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionTitle kicker="04 — experience" title="Where I've worked" />
        <ol className="timeline">
          {experience.map((job, i) => (
            <Reveal as="li" key={i} delay={i * 100}>
              <span className="timeline__period mono">{job.period}</span>
              <h3>
                {job.role} <span className="at">@ {job.company}</span>
              </h3>
              <p>{job.summary}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function StatusWindow() {
  const { status, location, coordinates } = profile
  const host = window.location.host || 'dustinevans.net'
  return (
    <section className="section">
      <div className="container">
        <Reveal className="window">
          <div className="window__bar">
            <span className="window__dots">
              <i /><i /><i />
            </span>
            <span className="window__url mono">{host}/status</span>
          </div>
          <div className="window__body">
            <p className="mono muted">Currently</p>
            <button
              type="button"
              className={`window__status ${status.open ? 'is-open' : 'is-closed'}`}
              onClick={() => confettiCannons()}
              title="Click me!"
            >
              {status.open ? 'OPEN TO WORK' : 'NOT LOOKING'}
            </button>
            <p>{status.note}</p>
            <div className="window__geo mono">
              {coordinates && <span>{coordinates}</span>}
              <span>{location}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <Reveal>
          <p className="mono kicker">05 — contact</p>
          <h2 className="contact__title">
            That's a wrap! <br />
            <span className="gradient-text">Let's connect.</span>
          </h2>
          <p className="contact__lead">
            Have a project in mind, a question, or just want to say hi? My inbox is open.
          </p>
        </Reveal>
        <Reveal as="ul" className="socials" delay={120}>
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.url} target={s.url.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
                <FontAwesomeIcon icon={iconFor(s.icon)} fixedWidth /> {s.label}
              </a>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProjects />
      <Photography />
      <Experience />
      <StatusWindow />
      <Contact />
    </>
  )
}
