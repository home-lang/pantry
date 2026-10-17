import { expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { recipe } from '../src/recipes/openjdk.org'

function install(requested: string, runtime: string, platform = 'linux', wrongChecksum = false) {
  const root = mkdtempSync(join(tmpdir(), 'pantry exact JDK '))
  const payload = join(root, 'payload')
  const home = join(payload, platform === 'darwin' ? 'jdk.jdk/Contents/Home' : 'jdk')
  const prefix = join(root, 'installed'), bin = join(root, 'bin')
  mkdirSync(home, { recursive: true }); mkdirSync(prefix); mkdirSync(bin)
  writeFileSync(join(home, 'release'), `JAVA_RUNTIME_VERSION="${runtime}"\n`)
  const archive = join(root, 'vendor.tar.gz')
  const packed = spawnSync('tar', ['-czf', archive, '-C', payload, platform === 'darwin' ? 'jdk.jdk' : 'jdk'])
  if (packed.status !== 0) throw new Error(packed.stderr.toString())
  const checksum = createHash('sha256').update(readFileSync(archive)).digest('hex')
  writeFileSync(join(bin, 'curl'), `#!/bin/bash
set -eu
url=''; output=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    https:*) url=$1 ;;
    -o) shift; output=$1 ;;
  esac
  shift
done
printf '%s\\n' "$url" >> "$FIXTURE_REQUESTS"
case "$url" in
  */binary/version/*) cp "$FIXTURE_ARCHIVE" "$output" ;;
  */checksum/version/*) printf '%s  vendor.tar.gz\\n' "$FIXTURE_SHA256" > "$output" ;;
  *) exit 99 ;;
esac
`, { mode: 0o755 })
  const requests = join(root, 'requests')
  const result = spawnSync('/bin/bash', [resolve(import.meta.dir, '../src/recipes/props/openjdk.org/install-temurin.sh'), requested, platform, platform === 'darwin' ? 'aarch64' : 'x86-64', prefix], {
    cwd: root, encoding: 'utf8', env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FIXTURE_ARCHIVE: archive, FIXTURE_REQUESTS: requests, FIXTURE_SHA256: wrongChecksum ? '0'.repeat(64) : checksum },
  })
  return { root, prefix, requests: existsSync(requests) ? readFileSync(requests, 'utf8') : '', result }
}

for (const platform of ['linux', 'darwin']) {
  test(`exact ${platform} JDK extraction verifies its checksum and upstream runtime identity`, () => {
    const fixture = install('17.0.20.8', '17.0.20+8', platform)
    try {
      expect(fixture.result.status, fixture.result.stderr).toBe(0)
      expect(fixture.requests).toContain(`/jdk-17.0.20%2B8/${platform === 'darwin' ? 'mac/aarch64' : 'linux/x64'}/`)
      expect(fixture.requests).not.toContain('/latest/')
      expect(readFileSync(join(fixture.prefix, 'share/pantry/java-runtime-version.txt'), 'utf8').trim()).toBe('17.0.20+8')
    }
    finally { rmSync(fixture.root, { recursive: true, force: true }) }
  })
}

test('an archive from a different JDK update cannot satisfy the requested package version', () => {
  const fixture = install('17.0.16.7', '17.0.19+10')
  try {
    expect(fixture.result.status).toBe(1)
    expect(fixture.result.stderr).toContain('JDK runtime identity mismatch')
  }
  finally { rmSync(fixture.root, { recursive: true, force: true }) }
})

test('checksum failure refuses extraction and incomplete pins never request latest', () => {
  const mismatch = install('17.0.20.8', '17.0.20+8', 'linux', true)
  try {
    expect(mismatch.result.status).not.toBe(0)
    expect(existsSync(join(mismatch.prefix, 'release'))).toBe(false)
  }
  finally { rmSync(mismatch.root, { recursive: true, force: true }) }
  const incomplete = install('17.0.20', '17.0.20+8')
  try {
    expect(incomplete.result.status).toBe(1)
    expect(incomplete.requests).toBe('')
  }
  finally { rmSync(incomplete.root, { recursive: true, force: true }) }
})


test('GA discovery includes older supported majors across pages and preserves exact upstream builds', async () => {
  const original = globalThis.fetch
  const pages: string[] = []
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input))
    pages.push(url.searchParams.get('page')!)
    const releases = pages.length === 1
      ? ['jdk-27+35', 'jdk-26.0.2.1+1', ...Array.from({ length: 98 }, (_, index) => `irrelevant-${index}`)]
      : pages.length === 2 ? ['jdk-17.0.20+8', 'jdk8u482-b08'] : []
    return releases.length ? Response.json({ releases }) : new Response(null, { status: 404 })
  }) as typeof fetch
  try {
    const source = recipe.versionSource
    if (source?.type !== 'custom') throw new Error('Expected official release discovery')
    expect(await source.fetch()).toEqual(['27.0.0.35', '26.0.2.1.1', '17.0.20.8', '8.0.482.8'])
    expect(pages).toEqual(['0', '1', '2'])
  }
  finally { globalThis.fetch = original }
})

test('exact security-update pins and Java 8 keep the vendor release spelling', () => {
  for (const [pin, runtime, path] of [
    ['17.0.20.1.1', '17.0.20.1+1', '/jdk-17.0.20.1%2B1/'],
    ['8.0.482.8', '1.8.0_482-b08', '/jdk8u482-b08/'],
    ['27.0.0.35', '27+35', '/jdk-27%2B35/'],
  ]) {
    const fixture = install(pin, runtime)
    try {
      expect(fixture.result.status, fixture.result.stderr).toBe(0)
      expect(fixture.requests).toContain(path)
    }
    finally { rmSync(fixture.root, { recursive: true, force: true }) }
  }
})
