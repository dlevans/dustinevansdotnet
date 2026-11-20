import Link from '../components/Link'

export default function NotFound() {
  return (
    <section className="section page page--center">
      <div className="container">
        <p className="mono kicker">404</p>
        <h1 className="page__title">
          These aren't the pages <br />
          <span className="gradient-text">you're looking for.</span>
        </h1>
        <p className="section-lead">This page doesn't exist (or it moved).</p>
        <div className="section-more">
          <Link to="/" className="btn">Take me home</Link>
        </div>
      </div>
    </section>
  )
}
