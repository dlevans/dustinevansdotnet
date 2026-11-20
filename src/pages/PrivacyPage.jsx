import { profile } from '../data/site'
import Link from '../components/Link'

const EFFECTIVE_DATE = 'November 17, 2026'

export default function PrivacyPage() {
  const name = `${profile.firstName} ${profile.lastName}`
  return (
    <section className="section page">
      <div className="container prose">
        <Link to="/" className="page__back mono">← back home</Link>
        <p className="mono kicker">legal</p>
        <h1 className="page__title">
          Privacy <span className="gradient-text">Policy</span>
        </h1>
        <p className="muted mono">Effective {EFFECTIVE_DATE}</p>

        <p className="prose__lead">
          This policy applies to the Android apps and websites published by {name}.
        </p>

        <h2>The short version</h2>
        <p>
          <strong>I don't collect, save, or sell your data.</strong>
        </p>

        <h2>Details</h2>
        <ul>
          <li>My apps don't ask you to create an account and don't collect personal information.</li>
          <li>
            I don't store your data on any server, and I don't sell, rent, or share it with anyone.
          </li>
          <li>
            If an app asks for a permission (for example, location for a map), that information is used
            only on your device to make the feature work. It isn't saved or sent to me.
          </li>
          <li>
            Some apps load content such as map tiles from third-party services. Those services have
            their own privacy policies.
          </li>
        </ul>

        <h2>Changes</h2>
        <p>If this policy ever changes, I'll update it on this page and change the date above.</p>

        <h2>Contact</h2>
        <p>
          Questions? Reach me through any of the links on the <Link to="/#contact">contact section</Link>.
        </p>
      </div>
    </section>
  )
}
