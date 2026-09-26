import type { SectionCopy } from '../types/content'

export function SectionHeading({ title, intro }: SectionCopy) {
  return <header className="section-heading"><h2>{title}</h2>{intro && <p>{intro}</p>}</header>
}
