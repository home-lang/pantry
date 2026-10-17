import { expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'
import { versionSatisfies } from '../scripts/build-package'

test('historical libxslt packages retain their own XML ABI without mutating the latest recipe', async () => {
  for (const platform of ['linux-x86-64', 'darwin-arm64']) {
    const current = await loadRecipe('gnome.org/libxslt', platform, '1.1.45')
    const historical = await loadRecipe('gnome.org/libxslt', platform, '1.1.43')
    const again = await loadRecipe('gnome.org/libxslt', platform, '1.1.45')
    if (!current.recipe.dependencies || !historical.recipe.dependencies) throw new Error('Missing declared runtime dependencies')
    expect(current.recipe.dependencies['gnome.org/libxml2']).toBe('~2.15.1')
    expect(historical.recipe.dependencies['gnome.org/libxml2']).toBe('~2.13')
    expect(again.recipe.dependencies).toEqual(current.recipe.dependencies)
    expect(versionSatisfies('2.15.4', historical.recipe.dependencies['gnome.org/libxml2'])).toBe(false)
    expect(versionSatisfies('2.13.9', historical.recipe.dependencies['gnome.org/libxml2'])).toBe(true)
  }
})

test('published dependency versions recompute ABI edges after a later transitive bound', async () => {
  const { resolveVersionedBuildDependencyGraph } = await import('../scripts/build-package')
  const platform = 'linux-x86-64'
  const selected: string[] = []
  const recipes: Record<string, Record<string, string>> = {
    'root.example@1.0.0': { 'shared.example': '*', 'later.example': '*' },
    'shared.example@2.0.0': { 'new-abi.example': '*' },
    'shared.example@1.0.0': { 'old-abi.example': '*' },
    'later.example@1.0.0': { 'shared.example': '<2' },
  }
  const graph = await resolveVersionedBuildDependencyGraph(new Map([['root.example', 'root.example ^1']]), platform,
    async domain => ({ versions: Object.fromEntries((domain === 'shared.example' ? ['2.0.0', '1.0.0'] : ['1.0.0']).map(version => [version, { platforms: { [platform]: {} } }])) }),
    async (domain, version) => {
      selected.push(`${domain}@${version}`)
      return { dependencies: recipes[`${domain}@${version}`] || {} }
    })
  expect(selected).toContain('shared.example@2.0.0')
  expect(selected).toContain('shared.example@1.0.0')
  expect(graph.has('old-abi.example')).toBe(true)
  expect(graph.has('new-abi.example')).toBe(false)
  expect(graph.get('shared.example')).toBe('shared.example <2')
})

test('distinct OpenSSL runtime ABIs coexist while the direct compiler dependency stays first', async () => {
  const { resolveCoexistingRuntimeGraph } = await import('../scripts/build-package')
  const platform = 'linux-x86-64'
  const graph = await resolveCoexistingRuntimeGraph(new Map([['ssl.example', 'ssl.example ^1.1'], ['kerberos.example', 'kerberos.example ^1']]), platform,
    async domain => ({ versions: Object.fromEntries((domain === 'ssl.example' ? ['3.0.1', '1.1.1'] : ['1.0.0']).map(version => [version, { platforms: { [platform]: {} } }])) }),
    async domain => ({ dependencies: domain === 'kerberos.example' ? { 'ssl.example': '^3' } : {} }))
  expect([...graph]).toEqual([['ssl.example', 'ssl.example =1.1.1'], ['kerberos.example', 'kerberos.example =1.0.0'], ['ssl.example@3.0.1', 'ssl.example =3.0.1']])
})

test('an exact resolved OpenSSL letter release remains installable without accepting a different release', () => {
  expect(versionSatisfies('1.1.1w', '^1.1')).toBe(true)
  expect(versionSatisfies('1.1.1w', '=1.1.1w')).toBe(true)
  expect(versionSatisfies('1.1.1w', '@1.1.1w')).toBe(true)
  expect(versionSatisfies('1.1.1v', '=1.1.1w')).toBe(false)
  expect(versionSatisfies('3.6.5', '=1.1.1w')).toBe(false)
})
