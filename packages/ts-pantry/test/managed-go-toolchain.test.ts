import { expect, test } from 'bun:test'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateBuildScript } from '../scripts/buildkit'

const platform = `${process.platform === 'darwin' ? 'darwin' : 'linux'}-${process.arch === 'arm64' ? 'arm64' : 'x86-64'}`

test('Go source builds require a resolved declared Go toolchain', () => {
  expect(() => generateBuildScript({ build: { script: ['go build ./...'] } }, 'fixture.org', '1.0', platform, '/tmp/go-fixture-prefix', '/tmp/go-fixture-build', {})).toThrow('declared go.dev')
})

test('a Go build selects its managed compiler and cannot auto-download another toolchain', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-go-build-'))
  try {
    const build = join(root, 'build')
    const prefix = join(root, 'prefix')
    const managed = join(root, 'go.dev', 'v1.26.0')
    const host = join(root, 'host-bin')
    const selected = join(root, 'selected')
    const forbidden = join(root, 'host-go')
    for (const directory of [build, prefix, host, join(managed, 'bin')]) mkdirSync(directory, { recursive: true })
    const executable = (file: string, script: string) => {
      writeFileSync(file, `#!/bin/sh\n${script}\n`)
      chmodSync(file, 0o755)
    }
    executable(join(host, 'go'), 'printf "%s\\n" "$0 $*" >> "$FORBIDDEN_HOST_GO"; exit 81')
    executable(join(managed, 'bin', 'go'), 'printf "%s\\n%s\\n%s\\n%s\\n" "$0" "$GOROOT" "$GOTOOLCHAIN" "$GOPATH" > "$SELECTED_GO"')
    const script = generateBuildScript({ buildDependencies: { 'go.dev': '^1' }, build: { script: ['go build ./...'] } }, 'fixture.org', '1.0', platform, prefix, build, { 'deps.go.dev.prefix': managed })
    const child = Bun.spawn(['bash', '-e', '-c', script], {
      cwd: build,
      env: { ...process.env, HOME: root, PATH: `${host}:/usr/bin:/bin`, GOROOT: '/unmanaged/go', GOTOOLCHAIN: 'auto', GOPATH: '/unmanaged/go-cache', SELECTED_GO: selected, FORBIDDEN_HOST_GO: forbidden },
      stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(5000),
    })
    const [status, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    expect({ status, output: status === 0 ? '' : stdout + stderr }).toEqual({ status: 0, output: '' })
    expect(readFileSync(selected, 'utf8').split('\n').slice(0, 3)).toEqual([join(managed, 'bin/go'), managed, 'local'])
    expect(readFileSync(selected, 'utf8').split('\n')[3]).toBe(join(build, '.home/go'))
    expect(existsSync(forbidden)).toBe(false)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
