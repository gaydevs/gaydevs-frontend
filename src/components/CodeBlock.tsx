import { TerminalWindow } from './TerminalWindow'

export function CodeBlock({ filename, attributes }: { filename: string; attributes: Record<string, string> }) {
  const entries = Object.entries(attributes)
  return <TerminalWindow title={filename} className="json-window">
    <pre><code>{'{\n'}{entries.map(([key, value], index) => <span className="code-line" key={key}>{'  '}<span className="json-key">{JSON.stringify(key)}</span>{': '}<span className="json-value">{JSON.stringify(value)}</span>{index < entries.length - 1 ? ',' : ''}{'\n'}</span>)}{'}'}</code></pre>
  </TerminalWindow>
}
