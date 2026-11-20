import { navigate, withSlash } from '../router'

/** In-site link that navigates without a full page reload. */
export default function Link({ to, onClick, children, ...rest }) {
  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to.startsWith('/') ? withSlash(to.split('#')[0]) + (to.includes('#') ? `#${to.split('#')[1]}` : '') : to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
