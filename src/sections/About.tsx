import type { Paragraph, SectionCopy } from '../types/content'
import { RichText } from '../components/RichText'
import { SectionHeading } from '../components/SectionHeading'

export function About({ content }: { content: SectionCopy & { paragraphs: Paragraph[]; highlights: string[] } }) {
  return <section className="section about container" id="sobre" aria-label={content.title}>
    <SectionHeading title={content.title} />
    <div className="about-copy">{content.paragraphs.map((paragraph, index) => <p key={index}><RichText parts={paragraph} /></p>)}</div>
    <ul className="highlights">{content.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
  </section>
}
