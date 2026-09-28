import type { SectionCopy } from '../types/content'
import { SectionHeading } from '../components/SectionHeading'

export function Topics({ content }: { content: SectionCopy & { items: string[] } }) {
  return <section className="section topics container" aria-label={content.title}>
    <SectionHeading {...content} />
    <ul className="chips">{content.items.map((item) => <li key={item}>{item}</li>)}</ul>
  </section>
}
