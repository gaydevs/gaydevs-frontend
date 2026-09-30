import type { Link, SectionCopy } from '../types/content'
import { SectionHeading } from '../components/SectionHeading'
import { ActionLink } from '../components/ActionLink'

export function FinalCta({ content, links }: { content: SectionCopy; links: Link[] }) {
  return <section className="section final-cta" aria-label={content.title}><div className="container">
    <SectionHeading {...content} />
    <div className="final-actions">{links.map((link, index) => <ActionLink key={link.href} link={link} secondary={index > 0} />)}</div>
  </div></section>
}
