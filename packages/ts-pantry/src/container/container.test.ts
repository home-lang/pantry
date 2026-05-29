import { describe, expect, it } from 'bun:test'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildImage } from './builder'
import { collectBuildContext } from './context'
import { parseDockerfile, parseExecForm, resolveBuildStages } from './dockerfile'
import { createMatcher, parseFreezer } from './freezerignore'
import { digest, digestHex } from './oci'
import { parseImageRef } from './registry'

describe('parseDockerfile', () => {
  it('parses a multi-stage Dockerfile into stages', () => {
    const df = `# syntax=docker/dockerfile:1
FROM oven/bun:1.3.10 AS base
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

FROM base AS release
ENV NODE_ENV=production
EXPOSE 3000/tcp
CMD ["bun", "run", "start"]`

    const parsed = parseDockerfile(df)
    expect(parsed.directives.syntax).toBe('docker/dockerfile:1')
    expect(parsed.stages).toHaveLength(2)
    expect(parsed.stages[0].baseImage).toBe('oven/bun:1.3.10')
    expect(parsed.stages[0].name).toBe('base')
    expect(parsed.stages[1].baseImage).toBe('base')
    expect(parsed.stages[1].name).toBe('release')
    // base stage: WORKDIR, COPY, RUN
    expect(parsed.stages[0].instructions.map(i => i.instruction)).toEqual(['WORKDIR', 'COPY', 'RUN'])
  })

  it('joins line continuations and keeps the source line', () => {
    const df = `FROM alpine
RUN echo one && \\
    echo two`
    const parsed = parseDockerfile(df)
    const run = parsed.stages[0].instructions[0]
    expect(run.instruction).toBe('RUN')
    expect(run.args).toBe('echo one &&     echo two')
    expect(run.line).toBe(2)
  })

  it('extracts instruction flags like COPY --from and --chown', () => {
    const df = `FROM scratch
COPY --from=build --chown=bun:bun /app /app`
    const parsed = parseDockerfile(df)
    const copy = parsed.stages[0].instructions[0]
    expect(copy.flags.from).toBe('build')
    expect(copy.flags.chown).toBe('bun:bun')
    expect(copy.args).toBe('/app /app')
  })

  it('collects global ARGs declared before the first FROM', () => {
    const df = `ARG BUN_VERSION=1.3.10
FROM oven/bun:\${BUN_VERSION}
RUN true`
    const parsed = parseDockerfile(df)
    expect(parsed.globalArgs).toHaveLength(1)
    expect(parsed.globalArgs[0].args).toBe('BUN_VERSION=1.3.10')
  })

  it('honors a custom escape directive', () => {
    const df = `# escape=\`
FROM alpine
RUN echo one \`
    echo two`
    const parsed = parseDockerfile(df)
    expect(parsed.stages[0].instructions[0].args).toBe('echo one     echo two')
  })

  it('parseExecForm distinguishes JSON-array from shell form', () => {
    expect(parseExecForm('["bun","run","start"]')).toEqual(['bun', 'run', 'start'])
    expect(parseExecForm('bun run start')).toBeUndefined()
  })

  it('resolveBuildStages slices to the target stage', () => {
    const df = `FROM a AS one
FROM b AS two
FROM c AS three`
    const parsed = parseDockerfile(df)
    expect(resolveBuildStages(parsed, 'two').map(s => s.name)).toEqual(['one', 'two'])
    expect(resolveBuildStages(parsed).map(s => s.name)).toEqual(['one', 'two', 'three'])
  })
})

describe('freezer matcher', () => {
  it('ignores matched files and supports negation', () => {
    const rules = parseFreezer(`# comment
node_modules
*.log
!keep.log
dist/`)
    const m = createMatcher(rules)
    expect(m.ignores('node_modules')).toBe(true)
    expect(m.ignores('node_modules/foo/bar.js')).toBe(true)
    expect(m.ignores('app.log')).toBe(true)
    expect(m.ignores('keep.log')).toBe(false)
    expect(m.ignores('dist')).toBe(true)
    expect(m.ignores('dist/index.js')).toBe(true)
    expect(m.ignores('src/index.ts')).toBe(false)
  })

  it('supports ** across separators and nested matches', () => {
    const m = createMatcher(parseFreezer(`**/*.test.ts\n**/node_modules`))
    expect(m.ignores('a/b/c.test.ts')).toBe(true)
    expect(m.ignores('packages/x/node_modules/dep/index.js')).toBe(true)
    expect(m.ignores('src/index.ts')).toBe(false)
  })
})

describe('collectBuildContext', () => {
  it('walks a dir and applies the matcher deterministically', () => {
    const dir = `${import.meta.dir}` // this package's container dir
    const m = createMatcher(parseFreezer('*.test.ts'))
    const entries = collectBuildContext(dir, m)
    const rels = entries.map(e => e.relPath)
    expect(rels).toContain('dockerfile.ts')
    expect(rels).not.toContain('container.test.ts')
    // sorted
    const sorted = [...rels].sort()
    expect(rels).toEqual(sorted)
  })
})

describe('oci helpers', () => {
  it('computes stable sha256 digests', () => {
    expect(digest(Buffer.from('hello'))).toBe('sha256:2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    expect(digestHex('sha256:abc')).toBe('abc')
  })
})

describe('parseImageRef', () => {
  it('expands official Docker Hub images to library/', () => {
    const r = parseImageRef('alpine')
    expect(r.repository).toBe('library/alpine')
    expect(r.tag).toBe('latest')
    expect(r.implicitRegistry).toBe(true)
  })

  it('parses org images with tags', () => {
    const r = parseImageRef('oven/bun:1.3.10')
    expect(r.repository).toBe('oven/bun')
    expect(r.tag).toBe('1.3.10')
    expect(r.implicitRegistry).toBe(true)
  })

  it('parses explicit registry + digest pin', () => {
    const r = parseImageRef('registry.pantry.dev/team/app@sha256:deadbeef')
    expect(r.registry).toBe('registry.pantry.dev')
    expect(r.repository).toBe('team/app')
    expect(r.digest).toBe('sha256:deadbeef')
    expect(r.implicitRegistry).toBe(false)
  })
})

describe('buildImage (scratch, offline)', () => {
  it('builds a FROM scratch image into a docker-archive + OCI layout', async () => {
    const ctx = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-ctx-'))
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-out-'))
    try {
      fs.writeFileSync(path.join(ctx, 'run'), '#!/bin/sh\necho hi\n')
      fs.writeFileSync(path.join(ctx, 'ignored.log'), 'noise')
      fs.writeFileSync(path.join(ctx, '.freezer'), '*.log\n')
      fs.writeFileSync(path.join(ctx, 'Dockerfile'), `FROM scratch
COPY . /app
ENV FOO=bar
EXPOSE 8080
WORKDIR /app
CMD ["/app/run"]
`)

      const result = await buildImage({ context: ctx, outputDir: out, tags: ['demo:latest'], quiet: true, runMode: 'skip' })

      expect(result.imageId).toMatch(/^sha256:/)
      expect(result.layers).toHaveLength(1)
      expect(result.config.config.Env).toContain('FOO=bar')
      expect(result.config.config.Cmd).toEqual(['/app/run'])
      expect(result.config.config.ExposedPorts).toEqual({ '8080/tcp': {} })
      expect(result.config.config.WorkingDir).toBe('/app')

      // Archive + layout exist.
      expect(fs.existsSync(result.archivePath!)).toBe(true)
      expect(fs.existsSync(path.join(result.ociLayoutPath!, 'index.json'))).toBe(true)
      expect(fs.existsSync(path.join(result.ociLayoutPath!, 'oci-layout'))).toBe(true)

      // docker-archive has manifest.json + config; the layer excludes *.log.
      const inspect = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-x-'))
      execFileSync('tar', ['xf', result.archivePath!, '-C', inspect])
      const manifest = JSON.parse(fs.readFileSync(path.join(inspect, 'manifest.json'), 'utf8'))
      expect(manifest[0].RepoTags).toEqual(['demo:latest'])
      expect(manifest[0].Layers).toHaveLength(1)
      // Extract the layer and confirm freezer filtering worked.
      const layerRel = manifest[0].Layers[0]
      const layerDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-l-'))
      execFileSync('tar', ['xf', path.join(inspect, layerRel), '-C', layerDir])
      expect(fs.existsSync(path.join(layerDir, 'app', 'run'))).toBe(true)
      expect(fs.existsSync(path.join(layerDir, 'app', 'ignored.log'))).toBe(false)
    }
    finally {
      fs.rmSync(ctx, { recursive: true, force: true })
      fs.rmSync(out, { recursive: true, force: true })
    }
  })
})
