/* eslint-disable no-console */
import { beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Minimal integration to verify hook ordering without running heavy installs
describe('dev hooks ordering', () => {
  const tmpDir = path.join(import.meta.dir, 'tmp-hooks')
  const envsDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs')

  beforeEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    }
    catch {}
    mkdirSync(tmpDir, { recursive: true })
    // deps.yaml enabling hooks
    writeFileSync(path.join(tmpDir, 'deps.yaml'), `
pkgs:
  - bun.sh

preSetup:
  enabled: true
  commands:
    - { command: "bash -lc 'echo preSetup >> hooks.log'" }
postSetup:
  enabled: true
  commands:
    - { command: "bash -lc 'echo postSetup >> hooks.log'" }
preActivation:
  enabled: true
  commands:
    - { command: "bash -lc 'echo preActivation >> hooks.log'" }
postActivation:
  enabled: true
  commands:
    - { command: "bash -lc 'echo postActivation >> hooks.log'" }
`, 'utf8')
    writeFileSync(path.join(tmpDir, 'hooks.log'), '', 'utf8')
  })

  it('runs hooks in correct phases and creates readiness marker', async () => {
    // Import dump programmatically
    const { dump } = await import('../src/dev/dump')

    await dump(tmpDir, { dryrun: false, quiet: true, shellOutput: false, skipGlobal: true } as any)

    const log = readFileSync(path.join(tmpDir, 'hooks.log'), 'utf8').trim().split('\n').filter(Boolean)
    // preSetup can run before postSetup; order between them is preSetup then postSetup
    const preIndex = log.indexOf('preSetup')
    const postIndex = log.indexOf('postSetup')
    expect(preIndex).toBeGreaterThanOrEqual(0)
    expect(postIndex).toBeGreaterThan(preIndex)

    // preActivation happens after installs/services (we only test it ran)
    expect(log.includes('preActivation')).toBeTrue()

    // postActivation executes at end (we only test it ran)
    expect(log.includes('postActivation')).toBeTrue()

    // readiness marker is created in env dir
    const crypto = await import('node:crypto')
    const fsmod = await import('node:fs')
    const resolved = fsmod.existsSync(tmpDir) ? fsmod.realpathSync(tmpDir) : tmpDir
    const md5 = crypto.createHash('md5').update(resolved).digest('hex')
    const hash = `${path.basename(resolved)}_${md5.slice(0, 8)}`

    // Compute dependency fingerprint to match dump.ts logic
    let depSuffix = ''
    try {
      const depsFilePath = path.join(tmpDir, 'deps.yaml')
      if (fsmod.existsSync(depsFilePath)) {
        const depContent = fsmod.readFileSync(depsFilePath)
        const depHash = crypto.createHash('md5').update(depContent).digest('hex').slice(0, 8)
        depSuffix = `-d${depHash}`
      }
    }
    catch {}

    const ready = path.join(envsDir, `${hash}${depSuffix}`, '.launchpad_ready')

    console.log('tmpDir:', tmpDir)
    console.log('resolved:', resolved)
    console.log('hash:', hash)
    console.log('depSuffix:', depSuffix)
    console.log('envsDir:', envsDir)
    console.log('expected ready path:', ready)
    console.log('ready file exists:', existsSync(ready))
    console.log('envs directory exists:', existsSync(path.join(envsDir, `${hash}${depSuffix}`)))

    // List files in env directory if it exists
    if (existsSync(path.join(envsDir, `${hash}${depSuffix}`))) {
      const files = fsmod.readdirSync(path.join(envsDir, `${hash}${depSuffix}`))
      console.log('files in env dir:', files)
    }

    expect(existsSync(ready)).toBeTrue()
  })
})
