import type { EventFormat, Photo, SectionCopy } from '../types/content'
import { PhotoFigure } from '../components/PhotoFigure'
import { SectionHeading } from '../components/SectionHeading'

interface EventsProps {
  content: SectionCopy
  formats: EventFormat[]
  photos: Photo[]
  guide: { title: string; items: { name: string; description: string }[] }
}
export function Events({ content, formats, photos, guide }: EventsProps) {
  return <section className="section events container" id="eventos" aria-label={content.title}>
    <SectionHeading {...content} />
    <div className="events-grid">{formats.map((format) => <article className={`event event--${format.id}`} key={format.id}>
      <h3>{format.title}</h3>
      {format.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {format.flow && <ol className="talk-flow">{format.flow.map((step, index) => <li key={step}>{index > 0 && <span aria-hidden="true">→ </span>}{step}</li>)}</ol>}
      {format.label && <p className="event-label">{format.label}</p>}
      <ul className="event-items">{format.items.map((item) => {
        const photo = item.photoId ? photos.find((candidate) => candidate.id === item.photoId) : undefined
        return <li key={item.title}>{photo ? <PhotoFigure photo={photo} caption={item.title} sizes="(min-width: 1024px) 300px, (min-width: 768px) 40vw, calc(100vw - 40px)" /> : <><span className="event-item-title">{item.title}</span>{item.description && <p>{item.description}</p>}</>}</li>
      })}</ul>
    </article>)}</div>
    <div className="format-guide"><h3>{guide.title}</h3><dl>{guide.items.map((item) => <div key={item.name}><dt>{item.name}</dt><dd><span aria-hidden="true">→ </span>{item.description}</dd></div>)}</dl></div>
  </section>
}
