import type { Link } from '../types/content'

export function ActionLink({ link, secondary = false }: { link: Link; secondary?: boolean }) {
  const external = link.href.startsWith('https://')
  return <a className={`action-link${secondary ? ' action-link--secondary' : ''}`} href={link.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
    <span>{link.label}</span>{external && <span aria-hidden="true">↗</span>}
  </a>
}
