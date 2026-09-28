import type { ReactNode } from 'react'

export function TerminalWindow({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return <div className={`terminal ${className}`}>
    <div className="terminal-bar"><span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>{title && <span className="terminal-label">{title}</span>}</div>
    <div className="terminal-body">{children}</div>
  </div>
}
