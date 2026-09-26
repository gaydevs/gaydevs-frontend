import type { Photo } from '../types/content'
import { ResponsiveImage } from './ResponsiveImage'

export function PhotoFigure({ photo, caption = photo.caption, sizes = '(min-width: 1024px) 360px, (min-width: 768px) 50vw, calc(100vw - 40px)' }: { photo: Photo; caption?: string; sizes?: string }) {
  return <figure className={`photo photo--${photo.id}`}>
    <ResponsiveImage image={photo.image} alt={photo.alt} sizes={sizes} />
    <figcaption>{caption}</figcaption>
  </figure>
}
