import { faGithub, faYoutube, faInstagram, faTiktok, faBluesky, faLinkedin, faTwitch } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons'

// Map the `icon` names used in src/data/site.js to Font Awesome icons
export const socialIcons = {
  github: faGithub,
  email: faEnvelope,
  youtube: faYoutube,
  instagram: faInstagram,
  tiktok: faTiktok,
  bluesky: faBluesky,
  linkedin: faLinkedin,
  twitch: faTwitch,
}

export const iconFor = (name) => socialIcons[name] || faLink
