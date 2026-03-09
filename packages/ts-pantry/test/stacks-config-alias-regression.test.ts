import { describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { resolveDependencies } from '../src/launchpad-api'

const stacksFixture = path.resolve(import.meta.dir, '../../zig/test-envs/stacks-config/dependencies.yaml')

const aliasToDomain: Record<string, string> = {
  'aws/cli': 'aws.amazon.com/cli',
  bun: 'bun.sh',
  gh: 'cli.github.com',
  zip: 'info-zip.org/zip',
  unzip: 'info-zip.org/unzip',
  sqlite3: 'sqlite.org',
  node: 'nodejs.org',
}

describe('Stacks config alias regression', () => {
  it('resolves the shipped Stacks fixture equivalently to canonical domains', async () => {
    const canonicalYaml = `dependencies:\n  aws.amazon.com/cli: ^2.22.26\n  bun.sh: ^1.2.13\n  cli.github.com: ^2.69.0\n  info-zip.org/zip: ^3.0\n  info-zip.org/unzip: ^6.0\n  sqlite.org: ^3.47.2\n  nodejs.org: ^22.12.0\n`
    const canonicalFile = path.join(os.tmpdir(), `stacks-config-canonical-${Date.now()}.yaml`)

    try {
      fs.writeFileSync(canonicalFile, canonicalYaml)

      const [fixtureResult, canonicalResult] = await Promise.all([
        resolveDependencies(stacksFixture, {
          targetOs: 'darwin',
          includeOsSpecific: true,
        }),
        resolveDependencies(canonicalFile, {
          targetOs: 'darwin',
          includeOsSpecific: true,
        }),
      ])

      expect(fixtureResult.directCount).toBe(canonicalResult.directCount)
      expect(fixtureResult.totalCount).toBe(canonicalResult.totalCount)

      const normalizeNames = (names: string[]) => names
        .map(name => aliasToDomain[name] ?? name)
        .sort()

      expect(normalizeNames(fixtureResult.packages.map(pkg => pkg.name))).toEqual(
        normalizeNames(canonicalResult.packages.map(pkg => pkg.name)),
      )

      expect(fixtureResult.launchpadCommand).toContain('aws/cli')
      expect(fixtureResult.launchpadCommand).toContain('bun')
      expect(fixtureResult.launchpadCommand).toContain('gh')
      expect(fixtureResult.launchpadCommand).toContain('sqlite3')

      expect(canonicalResult.launchpadCommand).toContain('aws.amazon.com/cli')
      expect(canonicalResult.launchpadCommand).toContain('bun.sh')
      expect(canonicalResult.launchpadCommand).toContain('cli.github.com')
      expect(canonicalResult.launchpadCommand).toContain('sqlite.org')
    }
    finally {
      try {
        fs.unlinkSync(canonicalFile)
      }
      catch {}
    }
  })
})
