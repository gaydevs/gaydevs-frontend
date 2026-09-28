import type { TimelineItem } from '../types/content'

export function TimelineEntry({ item }: { item: TimelineItem }) {
  return <li className={`timeline-entry commit-${item.type}`}>
    <div className="commit-meta"><time dateTime={item.date.split('.').reverse().join('-')}>{item.date}</time><span className="commit-badge">{item.type}</span></div>
    <h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
  </li>
}
