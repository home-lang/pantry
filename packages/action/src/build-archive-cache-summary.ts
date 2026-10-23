import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function buildArchiveCacheSummary(directory: string): Promise<string> {
  const content = await readFile(join(directory, 'events.jsonl'), 'utf8').catch(() => '')
  let origin = 0
  let avoided = 0
  const counts = { origin: 0, local: 0, github: 0 }
  let failures = 0
  const packages = new Map<string, number>()
  for (const line of content.trim().split('\n')) {
    if (!line) continue
    try {
      const event = JSON.parse(line)
      if (!Object.hasOwn(counts, event.source) || !Number.isFinite(event.bytes) || event.bytes < 0) continue
      counts[event.source as keyof typeof counts]++
      if (event.failed) failures++
      if (event.source === 'origin') {
        origin += event.bytes
        packages.set(event.label, (packages.get(event.label) || 0) + event.bytes)
      }
      else avoided += event.bytes
    }
    catch { /* Ignore an interrupted final log write. */ }
  }
  if (!Object.values(counts).some(Boolean)) return ''
  const mib = (bytes: number): string => (bytes / 1024 ** 2).toFixed(2)
  return `### Build dependency archive traffic\n\n| Source | Archive requests |\n| --- | ---: |\n| Object storage | ${counts.origin} |\n| Local cache | ${counts.local} |\n| GitHub cache | ${counts.github} |\n\nObject-storage archive bytes written: **${mib(origin)} MiB**. Avoided repeat downloads: **${mib(avoided)} MiB**. Failed archive downloads: **${failures}**. Metadata, upstream source downloads, and bytes discarded before writing to disk are excluded. These counters estimate archive traffic; provider billing remains authoritative.\n\n${[...packages].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, bytes]) => `- ${label.replace(/[\r\n|<>]/g, '')}: ${mib(bytes)} MiB`).join('\n')}\n`
}
