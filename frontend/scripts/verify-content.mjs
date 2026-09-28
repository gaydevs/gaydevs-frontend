import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Optional editorial audit: supply the approved CONTENT.md explicitly.
// Neither the application nor its build needs this external document.
if (!process.argv[2]) throw new Error('Usage: npm run check:content -- <approved CONTENT.md>')
const approved = (await readFile(resolve(process.argv[2]), 'utf8')).replace(/\r/g, '')
const normalize = (text) => text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx')
  const html = renderToStaticMarkup(createElement(App))
  const text = normalize(html
    .replace(/<(?:p|h[1-6]|li|figcaption|pre|dt|dd|div)\b[^>]*>/g, ' ')
    .replace(/<\/(?:p|h[1-6]|li|figcaption|pre|dt|dd|div)>/g, ' ')
    .replace(/<\/time>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))
  const content = approved.slice(approved.indexOf('## 1. Hero'))
  const snippets = []
  for (const block of content.matchAll(/(?:^>[^\n]*(?:\n|$))+/gm)) {
    snippets.push(...block[0].split(/\n>\s*\n/).map((paragraph) => normalize(paragraph.replace(/^> ?/gm, ''))).filter(Boolean))
  }
  for (const item of content.matchAll(/^- (.+)$/gm)) snippets.push(normalize(item[1]))
  for (const heading of content.matchAll(/^### (.+)$/gm)) snippets.push(normalize(heading[1]))
  for (const block of content.matchAll(/```(?:text|bash|json)\n([\s\S]*?)```/g)) {
    for (const line of block[1].split('\n').filter((line) => line.trim())) snippets.push(normalize(line))
  }
  const missing = snippets.filter((snippet) => !text.includes(snippet))
  assert.deepEqual(missing, [], 'Approved content missing or changed in rendered HTML')

  const { timeline } = await server.ssrLoadModule('/src/data/timeline.ts')
  const log = content.split('## 5. git log gaydevs')[1].split('## 6.')[0]
  const expectedTimeline = [...log.matchAll(/^(\d{2}\.\d{2}\.\d{4}) {2}(\w+)\n([^\n]+)(?:\n([^\n`]+))?/gm)].map((match) => ({ date: match[1], type: match[2], title: match[3], ...(match[4] ? { description: match[4] } : {}) }))
  assert.deepEqual(timeline, expectedTimeline, 'Timeline fields/order differ')

  const { lore } = await server.ssrLoadModule('/src/data/lore.ts')
  const expectedLore = [...content.matchAll(/```json\n([\s\S]*?)```/g)].map((match) => JSON.parse(match[1]))
  assert.deepEqual(lore.map((profile) => profile.attributes), expectedLore, 'Lore JSON differs')

  const { photos } = await server.ssrLoadModule('/src/data/photos.ts')
  const photoSection = content.split('## 6. gaydevs na prática')[1].split('## 7.')[0]
  const captions = [...photoSection.matchAll(/^- (.+)$/gm)].map((match) => match[1])
  assert.deepEqual(photos.map((photo) => photo.caption), captions, 'Photo order/captions differ')

  const { events } = await server.ssrLoadModule('/src/data/events.ts')
  const eventSection = content.split('## 4. Eventos')[1].split('## 5.')[0]
  assert.deepEqual(events.map((format) => format.title), [...eventSection.matchAll(/^### (.+)$/gm)].map((match) => match[1]), 'Event formats/order differ')
  const { community } = await server.ssrLoadModule('/src/data/community.ts')
  const communitySection = content.split('## 7. Como o gaydevs se organiza')[1].split('## 8.')[0]
  assert.deepEqual(community.map((space) => space.commands.join('\n')), [...communitySection.matchAll(/```bash\n([\s\S]*?)\n```/g)].map((match) => match[1]), 'Community commands/order differ')
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.equal((html.match(/<section\b/g) || []).length, 9)
  assert.ok(!/GayDevs?|lorem ipsum/.test(html))
  console.log(`PASS: ${snippets.length} literal excerpts in rendered HTML, ${timeline.length} exact timeline entries, both lore JSONs, six ordered captions, five event formats, four command blocks, nine sections and one h1.`)
} finally {
  await server.close()
}
