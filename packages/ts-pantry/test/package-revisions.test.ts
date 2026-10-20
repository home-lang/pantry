import { expect, test } from 'bun:test'
import { recipeBuildVersion, requireCurrentRecipeBuild, revisedPackageVersions } from '../scripts/package-revisions'
import { loadRecipe } from '../scripts/recipe-loader'
import { buildTokens, applyTokens } from '../scripts/buildkit'
import { compareVersions } from '../src/generate-zig'
import { compareVersionsDesc, resolveVersionFromMetadata } from '../src/version-utils'
import { parseInstallerConstraint, satisfiesInstallerConstraint } from '../src/installer'

test('packaging revisions preserve vendor releases and existing unrevised identities', () => {
  expect(revisedPackageVersions(['1.2.3', '1.2.2'])).toEqual(['1.2.3', '1.2.2'])
  expect(revisedPackageVersions(['155.0.8059.84', '154.0.1.2'], { '155.0.8059.84': 1 }))
    .toEqual(['155.0.8059.84.1', '154.0.1.2'])
  expect(recipeBuildVersion('155.0.8059.84.1', { '155.0.8059.84': 1 }))
    .toEqual({ upstream: '155.0.8059.84', current: '155.0.8059.84.1' })
})

test('historical revisions remain readable but cannot replace accepted package identities', () => {
  for (const version of ['1.2.3', '1.2.3.1']) {
    const identity = recipeBuildVersion(version, { '1.2.3': 2 })
    expect(identity).toEqual({ upstream: '1.2.3', current: '1.2.3.2' })
    expect(() => requireCurrentRecipeBuild(version, identity.current)).toThrow('refusing to replace')
  }
  expect(() => requireCurrentRecipeBuild('1.2.3.2', '1.2.3.2')).not.toThrow()
  expect(() => recipeBuildVersion('1.2.3.3', { '1.2.3': 2 })).toThrow('Undeclared')
})

test('ambiguous tuples and invalid revisions fail before catalog generation or a build', () => {
  for (const revision of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])
    expect(() => revisedPackageVersions(['1.2.3'], { '1.2.3': revision })).toThrow('Invalid')
  expect(() => revisedPackageVersions(['1.2.3.1'], { '1.2.3': 1 })).toThrow('conflicts')
  expect(() => revisedPackageVersions(['1.2.3'], { '1.2.3': 1, '1.2.3.4': 1 })).toThrow('fixed numeric')
  expect(() => recipeBuildVersion('1.2.3.01', { '1.2.3': 2 })).toThrow('Undeclared')
})

test('the normal recipe loader and build tokens download the vendor version for the revised package', async () => {
  const loaded = await loadRecipe('google.com/chrome', 'linux-x86-64', '155.0.8059.84.1')
  expect(loaded.upstreamVersion).toBe('155.0.8059.84')
  expect(loaded.publicationVersion).toBe('155.0.8059.84.1')
  const tokens = buildTokens('google.com/chrome', loaded.upstreamVersion!, 'linux-x86-64', '/package/v155.0.8059.84.1', '/source', {})
  const script = applyTokens((loaded.recipe.build!.script as string[]).join('\n'), tokens)
  expect(script).toContain('chrome-for-testing-public/155.0.8059.84/linux64/')
  expect(script).not.toContain('chrome-for-testing-public/155.0.8059.84.1/')
  expect(script).toContain('/package/v155.0.8059.84.1/lib')
})

test('both JavaScript catalogs and installer bounds preserve all five identity components', () => {
  const base = '155.0.8059.84'
  const revised = `${base}.1`
  for (const compare of [compareVersions, compareVersionsDesc]) {
    expect(compare(revised, base)).toBeLessThan(0)
    expect(compare(`${base}.2`, '155.0.8059.85')).toBeGreaterThan(0)
  }
  expect(resolveVersionFromMetadata(revised, [base, revised])).toBe(revised)
  expect(resolveVersionFromMetadata(`${base}.2`, [base, revised])).toBeNull()
  expect(satisfiesInstallerConstraint(base, parseInstallerConstraint(`>=${revised}`)!)).toBe(false)
  expect(satisfiesInstallerConstraint(`${base}.2`, parseInstallerConstraint(`<=${revised}`)!)).toBe(false)
})
