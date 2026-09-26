import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Topics } from './sections/Topics'
import { Events } from './sections/Events'
import { Timeline } from './sections/Timeline'
import { Gallery } from './sections/Gallery'
import { Community } from './sections/Community'
import { Lore } from './sections/Lore'
import { FinalCta } from './sections/FinalCta'
import { Footer } from './sections/Footer'
import { about, accessibility, finalCta, footer, hero, publicLinks, sections, topics } from './data/site'
import { events, formatGuide } from './data/events'
import { timeline } from './data/timeline'
import { photos } from './data/photos'
import { community } from './data/community'
import { lore } from './data/lore'
import { images } from './data/images'

export default function App() {
  return <>
    <a className="skip-link" href="#conteudo">{accessibility.skip}</a>
    <main id="conteudo">
      <Hero content={hero} mobile={images.heroMobile} desktop={images.heroDesktop} />
      <About content={about} />
      <Topics content={topics} />
      <Events content={sections.events} formats={events} photos={photos} guide={formatGuide} />
      <Timeline content={sections.timeline} items={timeline} />
      <Gallery content={sections.gallery} photos={photos} />
      <Community content={sections.community} spaces={community} />
      <Lore content={sections.lore} profiles={lore} mascot={images.cleito} mascotAlt={accessibility.cleito} />
      <FinalCta content={finalCta} links={publicLinks} />
    </main>
    <Footer content={footer} />
  </>
}
