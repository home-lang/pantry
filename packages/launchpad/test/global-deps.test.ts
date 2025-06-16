import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sniff from '../src/dev/sniff'

describe('Global Dependencies Flag', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-global-test-'))
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  function createDependenciesYaml(
    dir: string,
    deps: Record<string, string | { version?: string, global?: boolean }>,
    env?: Record<string, string>,
    topLevelGlobal?: boolean,
  ) {
    const content = []

    // Add top-level global flag if specified
    if (topLevelGlobal !== undefined) {
      content.push(`global: ${topLevelGlobal}`)
    }

    content.push(`dependencies:\n${Object.entries(deps)
      .map(([pkg, spec]) => {
        if (typeof spec === 'string') {
          return `  ${pkg}: ${spec}`
        }
        else {
          const lines = [`  ${pkg}:`]
          if (spec.version) {
            lines.push(`    version: ${spec.version}`)
          }
          if (spec.global !== undefined) {
            lines.push(`    global: ${spec.global}`)
          }
          return lines.join('\n')
        }
      })
      .join('\n')}`)

    if (env) {
      content.push(`env:\n${Object.entries(env).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`)
    }

    fs.writeFileSync(
      path.join(dir, 'dependencies.yaml'),
      content.join('\n'),
    )
  }

  it('should parse string format dependencies (existing behavior)', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': '1.2.3',
      'python.org': '^3.11',
    })

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(2)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      constraint: expect.objectContaining({
        range: '1.2.3',
      }),
    })
    expect(result.pkgs[0]).not.toHaveProperty('global')
    expect(result.pkgs[1]).toMatchObject({
      project: 'python.org',
      constraint: expect.objectContaining({
        range: '^3.11',
      }),
    })
    expect(result.pkgs[1]).not.toHaveProperty('global')
  })

  it('should parse object format with global flag', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': {
        version: '1.2.3',
        global: true,
      },
      'python.org': {
        version: '^3.11',
        global: false,
      },
    })

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(2)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      constraint: expect.objectContaining({
        range: '1.2.3',
      }),
      global: true,
    })
    expect(result.pkgs[1]).toMatchObject({
      project: 'python.org',
      constraint: expect.objectContaining({
        range: '^3.11',
      }),
      global: false,
    })
  })

  it('should parse mixed formats', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': {
        version: '1.2.3',
        global: true,
      },
      'python.org': '^3.11', // string format
    })

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(2)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      global: true,
    })
    expect(result.pkgs[1]).toMatchObject({
      project: 'python.org',
    })
    expect(result.pkgs[1]).not.toHaveProperty('global') // should not have global flag for string format
  })

  it('should default global to false when not specified', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': {
        version: '1.2.3',
        // global not specified
      },
    })

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(1)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      global: false,
    })
  })

  it('should handle latest version with global flag', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': {
        version: 'latest',
        global: true,
      },
    })

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(1)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      constraint: expect.objectContaining({
        range: '*',
      }),
      global: true,
    })
  })

  it('should handle missing version with global flag', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': {
        global: true,
        // version not specified, should default to '*'
      },
    })

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(1)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      constraint: expect.objectContaining({
        range: '*',
      }),
      global: true,
    })
  })

  it('should handle top-level global flag for all dependencies', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': '1.2.3',
      'python.org': '^3.11',
    }, undefined, true) // global: true at top level

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(2)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      constraint: expect.objectContaining({
        range: '1.2.3',
      }),
      global: true,
    })
    expect(result.pkgs[1]).toMatchObject({
      project: 'python.org',
      constraint: expect.objectContaining({
        range: '^3.11',
      }),
      global: true,
    })
  })

  it('should allow individual global flags to override top-level global flag', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': {
        version: '1.2.3',
        global: false, // Override top-level global: true
      },
      'python.org': '^3.11', // Uses top-level global: true
      'node.org': {
        version: '^20',
        global: true, // Explicit global (same as top-level)
      },
    }, undefined, true) // global: true at top level

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(3)

    // bun.sh should be local (overrides top-level global)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
      global: false,
    })

    // python.org should be global (uses top-level global)
    expect(result.pkgs[1]).toMatchObject({
      project: 'python.org',
      global: true,
    })

    // node.org should be global (explicit override)
    expect(result.pkgs[2]).toMatchObject({
      project: 'node.org',
      global: true,
    })
  })

  it('should handle top-level global: false correctly', async () => {
    createDependenciesYaml(tempDir, {
      'bun.sh': '1.2.3',
      'python.org': {
        version: '^3.11',
        global: true, // Override top-level global: false
      },
    }, undefined, false) // global: false at top level

    const result = await sniff({ string: tempDir })

    expect(result.pkgs).toHaveLength(2)

    // bun.sh should not have global property (top-level false, no individual override)
    expect(result.pkgs[0]).toMatchObject({
      project: 'bun.sh',
    })
    expect(result.pkgs[0]).not.toHaveProperty('global')

    // python.org should be global (individual override)
    expect(result.pkgs[1]).toMatchObject({
      project: 'python.org',
      global: true,
    })
  })
})
