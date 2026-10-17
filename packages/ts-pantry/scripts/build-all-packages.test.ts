import { afterEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyVersionPins, assignStripe, selectRecentVersions, isAppRecipePath, isPublishedArtifactRecord, isSourceUnavailableError, scriptCompiles, matchesRequestedPackage, parseRequestedPackages, pkgxHasPrebuilt, relocateMirroredPaths, normalizeMirroredArtifact, summariseTimings, type PackageTiming } from './build-all-packages'

describe('mirrored artifact publication normalization', () => {
  test('Linux artifacts require ELF normalization even on a foreign build host', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mirror-elf-'))
    try {
      mkdirSync(join(dir, 'bin'))
      const elf = Buffer.alloc(120)
      elf.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1])
      elf.writeUInt16LE(3, 16)
      elf.writeBigUInt64LE(64n, 32)
      elf.writeUInt16LE(56, 54)
      elf.writeUInt16LE(1, 56)
      elf.writeUInt32LE(2, 64)
      writeFileSync(join(dir, 'bin', 'openssl'), elf)
      expect(() => normalizeMirroredArtifact(dir, 'openssl.org', 'v3.6.5', 'linux-arm64', join(dir, 'missing-patchelf')))
        .toThrow('Cannot normalize ELF loader paths')
    }
    finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('preserves signed Darwin application binaries without host Mach-O tools', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mirror-signed-app-'))
    try {
      const contents = join(dir, 'lib', 'cmake', 'Example.app', 'Contents', 'MacOS')
      mkdirSync(contents, { recursive: true })
      const binary = join(contents, 'Example')
      const signedBytes = Buffer.from([0xcf, 0xfa, 0xed, 0xfe, 1, 2, 3, 4])
      writeFileSync(binary, signedBytes)
      const metadata = join(contents, 'ExampleConfig.cmake')
      const signedMetadata = 'set(PREFIX "${CMAKE_CURRENT_LIST_DIR}/../../../../example.org/v1/lib")'
      writeFileSync(metadata, signedMetadata)
      expect(() => normalizeMirroredArtifact(dir, 'example.org', 'v1', 'darwin-arm64', join(dir, 'missing-patchelf'))).not.toThrow()
      expect(readFileSync(binary)).toEqual(signedBytes)
      expect(readFileSync(metadata, 'utf8')).toBe(signedMetadata)
    }
    finally { rmSync(dir, { recursive: true, force: true }) }
  })
})

describe('pkgxHasPrebuilt', () => {
  const realFetch = globalThis.fetch
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  test('confirms an artifact pkgx actually serves, without pulling the body', async () => {
    let seen: { url: string, method?: string } | null = null
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      seen = { url: String(url), method: init?.method }
      return new Response(null, { status: 200 })
    }) as unknown as typeof fetch

    expect(await pkgxHasPrebuilt('cmake.org', '4.4.3', 'darwin-arm64')).toBe(true)
    expect(seen!.method).toBe('HEAD')
    expect(seen!.url).toBe('https://dist.pkgx.dev/cmake.org/darwin/aarch64/v4.4.3.tar.xz')
  })

  test('reports a 404 as not present', async () => {
    globalThis.fetch = (async () => new Response(null, { status: 404 })) as unknown as typeof fetch
    expect(await pkgxHasPrebuilt('redis.io', '8.10.1', 'darwin-arm64')).toBe(false)
  })

  // The whole point of the helper is to let a caller SKIP work, so an
  // inconclusive answer has to mean "do the work anyway". A probe that
  // reported `true` on a network blip would silently drop an artifact.
  test('fails closed when the probe itself fails', async () => {
    globalThis.fetch = (async () => { throw new Error('ECONNRESET') }) as unknown as typeof fetch
    expect(await pkgxHasPrebuilt('cmake.org', '4.4.3', 'darwin-arm64')).toBe(false)
  })

  test('fails closed for a platform pkgx has no dist path for', async () => {
    let called = false
    globalThis.fetch = (async () => { called = true; return new Response(null, { status: 200 }) }) as unknown as typeof fetch
    expect(await pkgxHasPrebuilt('cmake.org', '4.4.3', 'windows-x86-64')).toBe(false)
    expect(called).toBe(false)
  })
})

/**
 * The rule that decides whether a targeted publish goes red. Extracted here
 * because getting it wrong is expensive in both directions: too strict and the
 * pipeline is permanently red over a 2019 release nobody can fix, too loose and
 * a genuinely missing current version publishes as green — which is exactly how
 * cmake.org 4.4.3 stayed missing for eleven days.
 */
function classify(
  failed: Array<[string, { version: string }]>,
  latestOf: Map<string, string>,
  knownBroken: Set<string>,
  multiVersion = true,
) {
  const domainOf = (key: string) => (multiVersion ? key.replace(/@[^@]*$/, '') : key)
  const isNewest = ([key, result]: [string, { version: string }]) => {
    const latest = latestOf.get(domainOf(key))
    return latest === undefined || result.version === latest
  }
  const eligible = failed.filter(([key]) => !knownBroken.has(domainOf(key)))
  return { fatal: eligible.filter(isNewest), backfill: eligible.filter(e => !isNewest(e)) }
}

describe('targeted-build failure classification', () => {
  const latest = new Map([['cmake.org', '4.4.3'], ['lz4.org', '1.10.0']])

  test('a failed CURRENT version is fatal', () => {
    const { fatal, backfill } = classify([['cmake.org@4.4.3', { version: '4.4.3' }]], latest, new Set())
    expect(fatal).toHaveLength(1)
    expect(backfill).toHaveLength(0)
  })

  test('a failed OLD version is reported but tolerated', () => {
    const { fatal, backfill } = classify([['lz4.org@1.9.1', { version: '1.9.1' }]], latest, new Set())
    expect(fatal).toHaveLength(0)
    expect(backfill).toHaveLength(1)
  })

  test('one current failure among many old ones still fails the run', () => {
    const { fatal } = classify([
      ['lz4.org@1.9.1', { version: '1.9.1' }],
      ['lz4.org@1.8.3', { version: '1.8.3' }],
      ['cmake.org@4.4.3', { version: '4.4.3' }],
    ], latest, new Set())
    expect(fatal.map(([k]) => k)).toEqual(['cmake.org@4.4.3'])
  })

  test('known-broken domains are excluded from both buckets', () => {
    const { fatal, backfill } = classify(
      [['cmake.org@4.4.3', { version: '4.4.3' }]], latest, new Set(['cmake.org']),
    )
    expect(fatal).toHaveLength(0)
    expect(backfill).toHaveLength(0)
  })

  // Fail CLOSED: if we cannot tell which version is current for a domain, treat
  // the failure as fatal rather than quietly shrugging it off.
  test('an unknown domain is treated as fatal', () => {
    const { fatal } = classify([['mystery.org@1.0.0', { version: '1.0.0' }]], latest, new Set())
    expect(fatal).toHaveLength(1)
  })
})

describe('matchesRequestedPackage', () => {
  const sel = (domain: string, name: string, ...req: string[]) =>
    matchesRequestedPackage(domain, name, req)

  test('matches the domain or the name exactly', () => {
    expect(sel('cmake.org', 'cmake', 'cmake.org')).toBe(true)
    expect(sel('cmake.org', 'cmake', 'cmake')).toBe(true)
  })

  test('matches a path child, which is a real selector', () => {
    expect(sel('python.org/typing_extensions', 'typing_extensions', 'python.org')).toBe(true)
    expect(sel('apache.org/apr', 'apr', 'apache.org')).toBe(true)
  })

  // The bug this replaced: `p.domain.includes(d)` pulled unrelated packages into
  // a targeted publish, so a vim.org release could go red because macvim failed,
  // and the darwin gate could allocate a Mac for packages nobody asked about.
  test('does not match an unrelated package that merely contains the string', () => {
    expect(sel('macvim.org', 'macvim', 'vim.org')).toBe(false)
    expect(sel('lunarvim.org', 'lunarvim', 'vim.org')).toBe(false)
    expect(sel('ipython.org', 'ipython', 'python.org')).toBe(false)
  })

  test('a path child does not match a longer sibling prefix', () => {
    expect(sel('python.organisation.example', 'x', 'python.org')).toBe(false)
  })
})

describe('assignStripe', () => {
  const pkgs = (costs: number[]) => costs.map((c, i) => ({ domain: `d${String(i).padStart(3, '0')}.org`, cost: c }))
  const cost = (p: { cost: number }) => p.cost
  const allStripes = (list: ReturnType<typeof pkgs>, n: number) =>
    Array.from({ length: n }, (_, i) => assignStripe(list, i, n, cost))

  test('partitions exactly — every package once, none lost', () => {
    const list = pkgs([9, 1, 8, 2, 7, 3, 6, 4, 5, 10, 1, 1])
    const stripes = allStripes(list, 4)
    const seen = stripes.flat().map(p => p.domain).sort()
    expect(seen).toEqual(list.map(p => p.domain).sort())
    expect(new Set(seen).size).toBe(list.length)
  })

  // The point of the change: index-interleaving put 85% of the darwin download
  // work into two of four stripes. What matters is the WORST stripe, since the
  // run waits for it — not how evenly the rest sit.
  test('shortens the worst stripe compared with interleaving', () => {
    // Every 4th package is heavy, which is exactly the case interleaving
    // handles worst: stripe 0 collects all of them.
    const list = pkgs([100, 1, 1, 1, 100, 1, 1, 1, 100, 1, 1, 1])
    const total = (s: Array<{ cost: number }>) => s.reduce((sum, p) => sum + p.cost, 0)

    const balanced = Math.max(...allStripes(list, 4).map(total))
    const interleaved = Math.max(...[0, 1, 2, 3].map(i => total(list.filter((_, idx) => idx % 4 === i))))

    expect(interleaved).toBe(300) // all three heavy packages land together
    expect(balanced).toBe(100) // one each; the theoretical optimum here
    expect(balanced).toBeLessThan(interleaved)
  })

  test('spreads an evenly-weighted set evenly', () => {
    const list = pkgs(Array.from({ length: 40 }, () => 5))
    const loads = allStripes(list, 4).map(s => s.reduce((sum, p) => sum + p.cost, 0))
    expect(Math.max(...loads) - Math.min(...loads)).toBe(0)
  })

  // Each stripe computes the whole assignment independently, so they must agree.
  test('is deterministic regardless of input order', () => {
    const list = pkgs([5, 5, 5, 5, 3, 3, 3, 3])
    const shuffled = [...list].reverse()
    expect(assignStripe(list, 1, 3, cost).map(p => p.domain).sort())
      .toEqual(assignStripe(shuffled, 1, 3, cost).map(p => p.domain).sort())
  })

  test('a single stripe takes everything', () => {
    const list = pkgs([1, 2, 3])
    expect(assignStripe(list, 0, 1, cost)).toHaveLength(3)
  })

  test('preserves the caller ordering within a stripe', () => {
    const list = pkgs([1, 1, 1, 1, 1, 1])
    const s0 = assignStripe(list, 0, 2, cost).map(p => p.domain)
    expect(s0).toEqual([...s0].sort())
  })
})

describe('summariseTimings', () => {
  const ledger: PackageTiming[] = [
    { key: 'solr.apache.org@9.9.0', domain: 'solr.apache.org', version: '9.9.0', platform: 'darwin-arm64', status: 'failed' as const, totalMs: 73.8 * 60_000, phases: { package: 60_000, upload: 73 * 60_000 } },
    { key: 'solr.apache.org@9.10.0', domain: 'solr.apache.org', version: '9.10.0', platform: 'darwin-arm64', status: 'failed' as const, totalMs: 73.8 * 60_000, phases: { package: 60_000, upload: 73 * 60_000 } },
    { key: 'bun.sh@1.3.14', domain: 'bun.sh', version: '1.3.14', platform: 'darwin-arm64', status: 'uploaded' as const, totalMs: 90_000, phases: { mirror: 40_000, upload: 45_000 } },
    { key: 'jq.dev@1.8.1', domain: 'jq.dev', version: '1.8.1', platform: 'darwin-arm64', status: 'skipped' as const, totalMs: 300, phases: { exists: 250 } },
  ]

  test('ranks by wall clock so the cost driver is the first line, not an inference', () => {
    const { console: text } = summariseTimings(ledger, 176 * 60_000, 3)
    const slowest = text.split('\n').filter(line => line.includes('min  '))
    expect(slowest).toHaveLength(3)
    expect(slowest[0]).toContain('solr.apache.org@9.9.0')
    expect(slowest[2]).toContain('bun.sh@1.3.14')
    // Phases under a second are noise; the ones that cost minutes are named.
    expect(slowest[0]).toContain('upload 4380s')
  })

  test('reports how much of the wall clock the packages account for', () => {
    // The unexplained remainder is the signal: a stripe reporting 15 seconds of
    // timed work across 176 minutes is a measurement gap, not a fast stripe.
    const { console: text } = summariseTimings(ledger, 176 * 60_000)
    expect(text).toContain('Wall clock: 176.0 min')
    expect(text).toContain('attributed to packages: 149.1 min (85%)')
  })

  test('survives an empty run without dividing by zero', () => {
    const { console: text, markdown } = summariseTimings([], 0)
    expect(text).toContain('Wall clock: 0.0 min')
    expect(text).toContain('(—)')
    expect(markdown.join('\n')).toContain('### Timing')
  })
})

describe('isSourceUnavailableError', () => {
  test('reads the marker out of the message the child actually printed', () => {
    // The markers only ever appear in build-package.ts's OUTPUT, and the
    // rejection used to carry just the exit code — so a version whose tarball
    // 404s but which exits 1 rather than 42 was reported as a build failure
    // and counted against coverage, instead of as a phantom version.
    expect(isSourceUnavailableError({
      status: 1,
      message: 'build-package.ts exited with code 1: curl: (22) The requested URL returned error: 404',
    })).toBe(true)
    expect(isSourceUnavailableError({ status: 42, message: 'build-package.ts exited with code 42' })).toBe(true)
  })

  test('still calls a genuine compile failure a failure', () => {
    expect(isSourceUnavailableError({
      status: 1,
      message: 'build-package.ts exited with code 1: ld: symbol(s) not found for architecture arm64',
    })).toBe(false)
  })
})

describe('scriptCompiles', () => {
  // --download-only exists because a download recipe can be produced for any
  // platform from any box. That is only true while the script does not compile.
  // Detection keyed on `curl`, so ghostscript.com — which curls a SOURCE
  // tarball and then runs ./configure && make — was selected for darwin-arm64
  // on an ubuntu runner and died at "C compiler cannot create executables",
  // 23 times in one sweep.
  test('vetoes a recipe that curls source and then builds it', () => {
    const ghostscriptish = [
      "      'curl -fSL \"$GS_URL\" | tar xJ',",
      "      './configure $ARGS',",
      "      'make --jobs 4 install',",
    ].join('\n')
    expect(scriptCompiles(ghostscriptish)).toBe(true)
  })

  test('matches commands as they appear in recipe source, quoted and indented', () => {
    // The text is TypeScript source, so every command is a quoted array entry.
    // Anchoring to line start alone matched nothing at all.
    expect(scriptCompiles("      './configure --prefix=x',")).toBe(true)
    expect(scriptCompiles("      'make install',")).toBe(true)
    expect(scriptCompiles("      'cmake -B build',")).toBe(true)
    expect(scriptCompiles("      'cargo build --release',")).toBe(true)
    expect(scriptCompiles("      'go build ./cmd/x',")).toBe(true)
  })

  test('leaves a genuine download recipe alone', () => {
    const ctopish = [
      "      'case {{hw.platform}}+{{hw.arch}} in',",
      "      '  linux+aarch64)  ASSET=\"ctop-linux-arm64\" ;;',",
      "      'curl -Lfo ctop \"${BASE}/${ASSET}\"',",
      "      'install -Dm755 ctop {{prefix}}/bin/ctop',",
    ].join('\n')
    expect(scriptCompiles(ctopish)).toBe(false)
  })

  test('does not mistake mkdir or a makefile mention for a build', () => {
    expect(scriptCompiles("      'mkdir -p {{prefix}}/bin',")).toBe(false)
    expect(scriptCompiles('      // upstream ships no makefile,')).toBe(false)
  })
})

describe('isAppRecipePath', () => {
  // "App" used to mean "declares no linux platform" — a proxy that misreads a
  // GUI application shipping a linux build. gpt4all publishes a Qt Installer
  // Framework .run alongside its .dmg, so the proxy called it a CLI package and
  // the source sweep attempted it five times a run, each failing on an X11
  // library a CLI runner has no reason to carry. Location is what
  // check-desktop-updates.ts already treats as authoritative.
  test('recognises apps at any nesting depth', () => {
    expect(isAppRecipePath('apps')).toBe(true)
    expect(isAppRecipePath('apps/github.com/nomic-ai')).toBe(true)
  })

  test('does not capture unrelated prefixes that merely start with the letters', () => {
    expect(isAppRecipePath('appsflyer.com')).toBe(false)
    expect(isAppRecipePath('github.com/nomic-ai')).toBe(false)
    expect(isAppRecipePath('')).toBe(false)
  })
})

describe('isPublishedArtifactRecord', () => {
  // The existence check was `!!platforms[platform]` — key presence. The
  // registry carries stub records whose tarball URL serves nothing (77 for
  // llvm.org, 41 for flutter.dev, 30 for haskell.org), so the sweep believed
  // those platforms were done and skipped them on every run, forever.
  test('rejects the stub shape a failed upload leaves behind', () => {
    expect(isPublishedArtifactRecord({
      tarball: 'binaries/llvm.org/20.1.5/darwin-arm64/llvm.org-20.1.5.tar.gz',
      sha256: '',
      size: 0,
      uploadedAt: '',
    })).toBe(false)
  })

  test('accepts a record only a completed upload could have written', () => {
    expect(isPublishedArtifactRecord({
      tarball: 'binaries/llvm.org/23.1.0/darwin-arm64/llvm.org-23.1.0.tar.gz',
      sha256: 'a'.repeat(64),
      size: 1577000000,
      uploadedAt: '2026-09-08T01:29:45.697Z',
    })).toBe(true)
  })

  test('rejects partial damage, not just the all-empty case', () => {
    const good = { sha256: 'a'.repeat(64), size: 10, uploadedAt: '2026-09-08T01:29:45.697Z' }
    expect(isPublishedArtifactRecord({ ...good, size: 0 })).toBe(false)
    expect(isPublishedArtifactRecord({ ...good, sha256: '' })).toBe(false)
    expect(isPublishedArtifactRecord({ ...good, uploadedAt: '' })).toBe(false)
    expect(isPublishedArtifactRecord(undefined)).toBe(false)
    expect(isPublishedArtifactRecord(null)).toBe(false)
  })
})

describe('parseRequestedPackages', () => {
  test('plain domains select as before', () => {
    const r = parseRequestedPackages('cmake.org, zlib.net')
    expect(r.selectors).toEqual(['cmake.org', 'zlib.net'])
    expect(r.pins.size).toBe(0)
  })

  test('domain@version pins, and repeating an entry pins several', () => {
    const r = parseRequestedPackages('abseil.io@20250127.2,abseil.io@20240722.2,github.com/valhalla/valhalla')
    expect(r.selectors).toEqual(['abseil.io', 'github.com/valhalla/valhalla'])
    expect(r.pins.get('abseil.io')).toEqual(['20250127.2', '20240722.2'])
    expect(r.pins.has('github.com/valhalla/valhalla')).toBe(false)
  })
})

describe('applyVersionPins', () => {
  const pkg = (domain: string, name: string) => ({ domain, name, versions: ['20260817.0', '20250127.2'], latestVersion: '20260817.0' })

  test('narrows the named package to exactly the pinned versions', () => {
    const pinned = applyVersionPins(pkg('abseil.io', 'abseil'), new Map([['abseil.io', ['20250127.2']]]))
    expect(pinned.versions).toEqual(['20250127.2'])
    expect(pinned.latestVersion).toBe('20250127.2')
  })

  test('leaves unpinned packages and path children alone', () => {
    const pins = new Map([['python.org', ['3.12.0']]])
    const child = pkg('python.org/typing_extensions', 'typing_extensions')
    expect(applyVersionPins(child, pins)).toBe(child)
  })
})

describe('relocateMirroredPaths', () => {
  // The lines pkgx ships in abseil.io 20250127.2.0 (verbatim apart from the
  // library list): relative to pkgx's root, then back down through the domain.
  test('points a pkgx prebuilt\'s CMake and pkg-config files at their own prefix', () => {
    const dir = mkdtempSync(join(tmpdir(), 'relocate-'))
    try {
      mkdirSync(join(dir, 'lib', 'cmake', 'absl'), { recursive: true })
      mkdirSync(join(dir, 'lib', 'pkgconfig'), { recursive: true })
      const targets = join(dir, 'lib', 'cmake', 'absl', 'abslTargets.cmake')
      const release = join(dir, 'lib', 'cmake', 'absl', 'abslTargets-release.cmake')
      const pc = join(dir, 'lib', 'pkgconfig', 'absl_base.pc')
      writeFileSync(targets, 'set(_IMPORT_PREFIX "${CMAKE_CURRENT_LIST_DIR}/../../../../../abseil.io/v20250127.2.0")\n')
      writeFileSync(release, '  IMPORTED_LOCATION_RELEASE "${CMAKE_CURRENT_LIST_DIR}/../../../../../abseil.io/v20250127.2.0/lib/libabsl_log_severity.so.2501.0.0"\n')
      writeFileSync(pc, 'prefix=${pcfiledir}/../../../../abseil.io/v20250127.2.0\n')

      expect(relocateMirroredPaths(dir, 'abseil.io', 'v20250127.2.0')).toBe(3)
      expect(readFileSync(targets, 'utf-8')).toBe('set(_IMPORT_PREFIX "${CMAKE_CURRENT_LIST_DIR}/../../..")\n')
      expect(readFileSync(release, 'utf-8')).toBe('  IMPORTED_LOCATION_RELEASE "${CMAKE_CURRENT_LIST_DIR}/../../../lib/libabsl_log_severity.so.2501.0.0"\n')
      expect(readFileSync(pc, 'utf-8')).toBe('prefix=${pcfiledir}/../..\n')
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('leaves other packages\' paths and longer version names alone', () => {
    const dir = mkdtempSync(join(tmpdir(), 'relocate-'))
    try {
      mkdirSync(join(dir, 'lib', 'cmake', 'x'), { recursive: true })
      const file = join(dir, 'lib', 'cmake', 'x', 'xTargets.cmake')
      const text = [
        '"${CMAKE_CURRENT_LIST_DIR}/../../../../../zlib.net/v1.3.1/lib/libz.so"',
        '"${CMAKE_CURRENT_LIST_DIR}/../../../../../abseil.io/v20250127.2.0.1/lib"',
      ].join('\n')
      writeFileSync(file, text)
      expect(relocateMirroredPaths(dir, 'abseil.io', 'v20250127.2.0')).toBe(0)
      expect(readFileSync(file, 'utf-8')).toBe(text)
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('selectRecentVersions', () => {
  // python.org as the catalog lists it: twenty-two 3.14/3.13 patches ahead of 3.12.
  const python = {
    domain: 'python.org',
    versions: [
      ...Array.from({ length: 9 }, (_, i) => `3.14.${8 - i}`),
      ...Array.from({ length: 13 }, (_, i) => `3.13.${16 - i}`),
      '3.12.14', '3.12.13', '3.11.16', '3.11.15', '3.10.20', '3.9.25', '3.8.20', '2.7.18',
    ],
  }

  test('keeps a slot for older minor lines, so ~3.11 has something to resolve to', () => {
    const picked = selectRecentVersions(python, 20)
    expect(picked).toHaveLength(20)
    expect(picked.slice(0, 15)).toEqual(python.versions.slice(0, 15))
    for (const v of ['3.12.14', '3.11.16', '3.10.20', '3.9.25', '3.8.20'])
      expect(picked).toContain(v)
    // Only the newest patch of an older line.
    expect(picked).not.toContain('3.11.15')
  })

  test('a short list is taken whole, and order stays newest-first', () => {
    expect(selectRecentVersions({ domain: 'x.org', versions: ['2.1.0', '2.0.0', '1.9.0'] }, 5)).toEqual(['2.1.0', '2.0.0', '1.9.0'])
    const picked = selectRecentVersions(python, 5)
    expect(picked).toEqual(['3.14.8', '3.14.7', '3.14.6', '3.14.5', '3.13.16'])
  })

  test('falls back to recency when every release is on one line', () => {
    const single = { domain: 'y.org', versions: ['1.0.9', '1.0.8', '1.0.7', '1.0.6', '1.0.5', '1.0.4'] }
    expect(selectRecentVersions(single, 4)).toEqual(['1.0.9', '1.0.8', '1.0.7', '1.0.6'])
  })
})
