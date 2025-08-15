/* eslint-disable no-console */
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { dump } from '../src/dev/dump'

function makeTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`))
  return dir
}

function generateProjectHashForTest(projectPath: string): string {
  const resolvedPath = fs.existsSync(projectPath) ? fs.realpathSync(projectPath) : projectPath
  const hash = crypto.createHash('md5').update(resolvedPath).digest('hex')
  const projectName = path.basename(resolvedPath)
  return `${projectName}_${hash.slice(0, 8)}`
}

describe('Post-setup with PostgreSQL readiness in shell fast-path', () => {
  let projectDir: string
  let binDir: string
  let originalPath: string
  let envDir: string

  beforeAll(() => {
    projectDir = makeTempDir('lp-postsetup')
    binDir = path.join(projectDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })

    // Minimal deps.yaml enabling services and pkgs for sniffing
    const depsYaml = `
services:
  enabled: true
  autoStart:
    - postgres

pkgs:
  - postgresql.org
  - php.net
`
    fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsYaml)

    // launchpad.config.ts with a postSetup that looks like laravel migrate
    const configTs = `
      import type { LaunchpadConfig } from '@stacksjs/launchpad'
      export default {
        postSetup: {
          enabled: true,
          commands: [
            { name: 'migrate-fresh-seed', command: 'artisan migrate:fresh --seed', description: 'Fresh migrate and seed the database' }
          ]
        }
      } satisfies LaunchpadConfig
    `
    fs.writeFileSync(path.join(projectDir, 'launchpad.config.ts'), configTs)

    // .env indicating postgres
    fs.writeFileSync(path.join(projectDir, '.env'), 'DB_CONNECTION=pgsql\nDB_HOST=127.0.0.1\nDB_PORT=5432\n')

    // Mock pg_isready that always reports ready
    const pgIsReady = path.join(binDir, 'pg_isready')
    fs.writeFileSync(pgIsReady, '#!/bin/sh\nexit 0\n')
    fs.chmodSync(pgIsReady, 0o755)

    // Mock artisan that writes a marker file
    const artisan = path.join(binDir, 'artisan')
    fs.writeFileSync(artisan, `#!/bin/sh\necho \"artisan called with args: $@\" > \"${path.join(projectDir, 'artisan-debug.log')}\"\nif [ \"$1\" = \"migrate:fresh\" ]; then echo migrated > \"${path.join(projectDir, 'migrated.marker')}\"; fi; exit 0\n`)
    fs.chmodSync(artisan, 0o755)

    // Compute envDir exactly like dump.ts
    const envHash = generateProjectHashForTest(projectDir)
    envDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', envHash)
    fs.mkdirSync(envDir, { recursive: true })
    fs.writeFileSync(path.join(envDir, '.launchpad_ready'), '1')
    // Create expected bin/sbin to satisfy composed PATH
    fs.mkdirSync(path.join(envDir, 'bin'), { recursive: true })
    fs.mkdirSync(path.join(envDir, 'sbin'), { recursive: true })

    originalPath = process.env.PATH || ''
    process.env.PATH = `${binDir}:${originalPath}`
    process.env.LAUNCHPAD_TEST_MODE = 'true'
  })

  afterAll(() => {
    process.env.PATH = originalPath
    try {
      fs.rmSync(projectDir, { recursive: true, force: true })
    }
    catch {}
    try {
      fs.rmSync(envDir, { recursive: true, force: true })
    }
    catch {}
  })

  it.skip('runs post-setup after services and completes without connection errors', async () => {
    await dump(projectDir, { shellOutput: true, quiet: true })

    // Check if artisan was called at all
    const debugLogPath = path.join(projectDir, 'artisan-debug.log')
    console.log('Debug log exists:', fs.existsSync(debugLogPath))
    if (fs.existsSync(debugLogPath)) {
      console.log('Debug log content:', fs.readFileSync(debugLogPath, 'utf8'))
    }

    // Expect our mock artisan to have executed
    const markerPath = path.join(projectDir, 'migrated.marker')
    expect(fs.existsSync(markerPath)).toBe(true)
    // And the idempotent marker to be created
    const postMarker = path.join(envDir, 'pkgs', '.post_setup_done')
    expect(fs.existsSync(postMarker)).toBe(true)
  })
})
