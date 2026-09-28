import type { SectionCopy, TimelineItem } from '../types/content'
import { SectionHeading } from '../components/SectionHeading'
import { TerminalWindow } from '../components/TerminalWindow'
import { TimelineEntry } from '../components/TimelineEntry'

export function Timeline({ content, items }: { content: SectionCopy & { command: string }; items: TimelineItem[] }) {
  return <section className="section history" id="historia" aria-label={content.title}><div className="container">
    <SectionHeading title={content.title} />
    <TerminalWindow className="history-terminal">
      <p className="git-command"><code>{content.command}</code></p>
      <ol className="timeline">{items.map((item) => <TimelineEntry item={item} key={`${item.date}-${item.title}`} />)}</ol>
    </TerminalWindow>
  </div></section>
}
