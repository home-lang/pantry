/** Read stable artifact versions from Maven Central's canonical metadata. */
export async function mavenVersions(group: string, artifact: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch): Promise<string[]> {
  if (!group.split('.').every(part => /^[a-zA-Z0-9_-]+$/.test(part)) || !/^[a-zA-Z0-9_-]+$/.test(artifact))
    throw new Error('Invalid Maven artifact coordinates')
  const url = `https://repo.maven.apache.org/maven2/${group.replaceAll('.', '/')}/${artifact}/maven-metadata.xml`
  const response = await fetcher(url, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`${group}:${artifact} version discovery returned HTTP ${response.status}`)
  const body = await response.text()
  const versions = [...new Set([...body.matchAll(/<version>\s*(\d+(?:\.\d+){1,3})\s*<\/version>/g)].map(match => match[1]!))]
  if (!versions.length) throw new Error(`${group}:${artifact} published no stable versions`)
  return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}
