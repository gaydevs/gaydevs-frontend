import type { CommunitySpace, SectionCopy } from '../types/content'
import { SectionHeading } from '../components/SectionHeading'
import { TerminalWindow } from '../components/TerminalWindow'

export function Community({ content, spaces }: { content: SectionCopy; spaces: CommunitySpace[] }) {
  return <section className="section community container" id="comunidade" aria-label={content.title}>
    <SectionHeading {...content} />
    <div className="community-grid">{spaces.map((space) => <TerminalWindow key={space.path}>
      <h3 className="sr-only">{space.path}</h3>
      <pre className="terminal-commands"><code>{space.commands.join('\n')}</code></pre>
      <p className="space-label">{space.label}</p>
      <p className="space-description">{space.description}</p>
    </TerminalWindow>)}</div>
  </section>
}
