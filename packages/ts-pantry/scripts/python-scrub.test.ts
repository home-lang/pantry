import { expect, test } from 'bun:test'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateBuildScript } from './buildkit'

test('a Python recipe uses its managed interpreter without modifying host setuptools', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-python-build-'))
  const build = join(root, 'build')
  const prefix = join(root, 'prefix')
  const managed = join(root, 'python.org', 'v3.13.0')
  const host = join(root, 'host-bin')
  const selected = join(root, 'selected')
  const forbidden = join(root, 'host-mutation')
  try {
    for (const directory of [build, prefix, host, join(managed, 'bin')]) mkdirSync(directory, { recursive: true })
    const executable = (file: string, script: string) => {
      writeFileSync(file, `#!/bin/sh\n${script}\n`)
      chmodSync(file, 0o755)
    }
    // Intercept host-changing commands even if a future bootstrap suppresses
    // their exit status. This fixture never permits sudo or a host pip install.
    for (const name of ['sudo', 'pip', 'pip3', 'python3']) {
      executable(join(host, name), 'printf "%s\\n" "$0 $*" >> "$FORBIDDEN_HOST_COMMANDS"; exit 81')
    }
    const python = join(managed, 'bin', 'python3')
    executable(python, 'case "$*" in *pip*install*) printf "%s\\n" "$0 $*" >> "$FORBIDDEN_HOST_COMMANDS"; exit 82;; esac\nprintf "%s\\n%s\\n" "$0" "$*" > "$SELECTED_PYTHON"')
    const platform = `${process.platform === 'darwin' ? 'darwin' : 'linux'}-${process.arch === 'arm64' ? 'arm64' : 'x86-64'}`
    const script = generateBuildScript({
      buildDependencies: { 'python.org': '~3.13' },
      build: { script: ['python3 -c "import setuptools"'] },
    }, 'python-fixture.org', '1.0.0', platform, prefix, build, { 'deps.python.org.prefix': managed })
    const child = Bun.spawn(['bash', '-e', '-c', script], {
      cwd: build,
      env: { ...process.env, HOME: root, PATH: `${host}:/usr/bin:/bin`, SELECTED_PYTHON: selected, FORBIDDEN_HOST_COMMANDS: forbidden },
      stdout: 'pipe',
      stderr: 'pipe',
      signal: AbortSignal.timeout(5000),
    })
    const [status, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    expect({ status, output: status === 0 ? '' : stdout + stderr }).toEqual({ status: 0, output: '' })
    expect(readFileSync(selected, 'utf8')).toBe(`${python}\n-c import setuptools\n`)
    expect(existsSync(forbidden)).toBe(false)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
