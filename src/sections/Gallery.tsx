import type { Photo, SectionCopy } from '../types/content'
import { PhotoFigure } from '../components/PhotoFigure'
import { SectionHeading } from '../components/SectionHeading'

export function Gallery({ content, photos }: { content: SectionCopy; photos: Photo[] }) {
  return <section className="section gallery container" aria-label={content.title}>
    <SectionHeading {...content} />
    <div className="photo-grid">{photos.map((photo) => <PhotoFigure key={photo.id} photo={photo} sizes="(min-width: 1024px) 360px, calc(100vw - 40px)" />)}</div>
  </section>
}
