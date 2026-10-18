/** Discover native tarballs from the project's published release page. */
export async function netfilterVersions(project: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch): Promise<string[]> {
  if (!/^[a-z][a-z0-9]*$/.test(project)) throw new Error('Invalid netfilter project')
  const response = await fetcher(`https://www.netfilter.org/projects/${project}/downloads.html`, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`${project} version discovery returned HTTP ${response.status}`)
  const body = await response.text()
  const pattern = new RegExp(`href\\s*=\\s*["'](?:files/)?${project}-(\\d+\\.\\d+\\.\\d+)\\.tar\\.(?:xz|bz2)["']`, 'gi')
  const versions = [...new Set([...body.matchAll(pattern)].map(match => match[1]!))]
  if (!versions.length) throw new Error(`${project} published no native source archive versions`)
  return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}
