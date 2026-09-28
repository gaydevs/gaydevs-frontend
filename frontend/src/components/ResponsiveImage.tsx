import type { ImageAsset } from '../types/content'

export function ResponsiveImage({ image, alt, sizes, className }: { image: ImageAsset; alt: string; sizes: string; className?: string }) {
  return <picture className={className}>
    <source type="image/webp" srcSet={image.sources.map((source) => `${source.src} ${source.width}w`).join(', ')} sizes={sizes} />
    <img src={image.src} width={image.width} height={image.height} alt={alt} loading="lazy" decoding="async" />
  </picture>
}
