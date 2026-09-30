import type { ImageAsset, LoreProfile, SectionCopy } from '../types/content'
import { CodeBlock } from '../components/CodeBlock'
import { RichText } from '../components/RichText'
import { ResponsiveImage } from '../components/ResponsiveImage'
import { SectionHeading } from '../components/SectionHeading'

export function Lore({ content, profiles, mascot, mascotAlt }: { content: SectionCopy; profiles: LoreProfile[]; mascot: ImageAsset; mascotAlt: string }) {
  return <section className="section lore container" aria-label={content.title}>
    <SectionHeading {...content} />
    <div className="lore-grid">{profiles.map((profile, index) => <article className={`lore-profile${index === 0 ? ' lore-profile--mascot' : ''}`} key={profile.filename}>
      <div className="lore-copy"><h3 className="sr-only">{profile.name}</h3><CodeBlock filename={profile.filename} attributes={profile.attributes} />
        {profile.paragraphs.map((paragraph, i) => <p key={i}><RichText parts={paragraph} /></p>)}
      </div>
      {index === 0 && <ResponsiveImage className="mascot-art" image={mascot} alt={mascotAlt} sizes="(min-width: 1024px) 480px, (min-width: 768px) 520px, calc(100vw - 40px)" />}
    </article>)}</div>
  </section>
}
