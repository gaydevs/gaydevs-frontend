import type { Link } from '../types/content'

export function Footer({ content, developerLinks }: { content: { brand: string; location: string; author: Link; role: string }; developerLinks: Link[] }) {
  return <footer className="footer container">
    <div>
      <p className="footer-brand">{content.brand}</p>
      <p>{content.location}</p>
    </div>
    <nav className="footer-links" aria-label="links dev">
      <p>github</p>
      <ul>
        {developerLinks.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true"> ↗</span></a></li>)}
      </ul>
    </nav>
    <div className="footer-author">
      <a href={content.author.href} target="_blank" rel="noopener noreferrer">{content.author.label}<span aria-hidden="true"> ↗</span></a>
      <p>{content.role}</p>
    </div>
  </footer>
}
