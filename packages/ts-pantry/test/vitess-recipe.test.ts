// vitess.io package/recipe consistency.
//
// A Vitess package is defined in three places that can drift independently:
//
//   1. `src/packages/vitessio.ts`  — what the registry ADVERTISES
//   2. `src/recipes/vitess.io.ts`  — what the build DECLARES
//   3. the `cp` loop inside that recipe's build script — what it actually INSTALLS
//
// Drift between them is silent and only surfaces at install time, as a
// package that promises a binary the tarball does not contain. These tests
// make the three agree by construction, so the failure happens in CI on the
// commit that caused it.

import { describe, expect, it } from 'bun:test'
import { pantry } from '../src/index'
import { processScript } from '../scripts/buildkit'
import * as mysqlRecipeModule from '../src/recipes/mysql.com'
import { recipe } from '../src/recipes/vitess.io'

const pkg = (pantry as any).vitessio

describe('vitess.io is registered', () => {
  it('resolves by domain key and by alias', () => {
    expect(pkg).toBeDefined()
    expect(pkg.domain).toBe('vitess.io')
    // The alias is what makes `pantry install vitess` work.
    expect((pantry as any).vitess).toBe(pkg)
  })

  it('points at the real upstream repository', () => {
    expect(pkg.githubUrl).toBe('https://github.com/vitessio/vitess')
    expect(recipe.github).toBe('https://github.com/vitessio/vitess')
  })
})

describe('the three program lists agree', () => {
  const installed = (): string[] => {
    // Extract the binaries the build script actually copies. Parsing the
    // script is the point: a name added to `programs` but not to the loop
    // would otherwise pass every other check and fail only on install.
    const script = recipe.build.script.map(s => (typeof s === 'string' ? s : String((s as any).run))).join('\n')
    const loop = script.split('\n').find(line => line.includes('for b in'))
    expect(loop).toBeDefined()
    const between = (loop as string).slice((loop as string).indexOf('for b in') + 'for b in'.length)
    return between.slice(0, between.indexOf(';')).trim().split(/\s+/)
  }

  it('the package advertises exactly what the recipe declares', () => {
    expect([...pkg.programs].sort()).toEqual([...recipe.programs].sort())
  })

  it('the recipe installs exactly what it declares', () => {
    expect(installed().sort()).toEqual([...recipe.programs].sort())
  })

  it('includes the daemons a cluster actually runs', () => {
    // A regression here would produce a package that installs but cannot run
    // a cluster, which is worse than one that fails to install.
    for (const required of ['vtgate', 'vttablet', 'vtctld', 'vtctldclient', 'vtorc'])
      expect(recipe.programs).toContain(required)
  })

  it('includes vtcombo, which the single-box preset depends on', () => {
    // Upstream's `make install` omits it because their packaging targets
    // production only; a dev cluster in one process needs it.
    expect(recipe.programs).toContain('vtcombo')
  })

  it('ships no test harnesses', () => {
    // `go build ./go/...` also emits these; copying them would bloat the
    // artifact and widen the attack surface for no benefit.
    for (const excluded of ['vtgateclienttest', 'vttestserver', 'zkctl', 'zkctld', 'zk'])
      expect(recipe.programs).not.toContain(excluded)
  })
})

describe('build configuration', () => {
  it('builds from source rather than repackaging the release', () => {
    // Vitess publishes one x86_64 tarball. Repackaging it would leave every
    // arm64 box unable to install, and would carry ~600MB of binaries and
    // fixtures no deployment uses.
    expect(recipe.distributable?.url).toContain('/archive/refs/tags/')
    expect(recipe.distributable?.url).not.toContain('/releases/download/')
  })

  it('compiles statically so the artifact is not tied to the build image libc', () => {
    expect(recipe.build.env?.CGO_ENABLED).toBe('0')
  })

  it('skips the vtadmin web build, which needs a Node toolchain', () => {
    const script = recipe.build.script.map(String).join('\n')
    expect(script).toContain('NOVTADMINBUILD=1')
  })

  it('requires a Go version that can actually build this source', () => {
    // Vitess v24 declares `go 1.26` in go.mod; an older toolchain fails with
    // an unhelpful module error.
    expect(recipe.buildDependencies?.['go.dev']).toBe('^1.26')
  })

  it('tracks upstream releases for version discovery', () => {
    expect(recipe.versionSource).toEqual({ type: 'github-releases', repo: 'vitessio/vitess' })
  })

  it('verifies the built binaries can start', () => {
    // The failure that matters most is a binary that compiled but cannot run
    // on the target platform.
    const test = recipe.test?.script.join('\n') ?? ''
    expect(test).toContain('vtgate --version')
    expect(test).toContain('vtctldclient --version')
  })
})

describe('version metadata', () => {
  it('lists versions newest first', () => {
    const parse = (v: string) => v.split('.').map(Number)
    for (let i = 1; i < pkg.versions.length; i++) {
      const [a, b] = [parse(pkg.versions[i - 1]), parse(pkg.versions[i])]
      const newer = a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] >= b[2]
      expect(newer).toBe(true)
    }
  })

  it('contains only stable releases', () => {
    // Pre-releases would be offered for install as if they were supported.
    for (const v of pkg.versions) expect(v).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('has no duplicates', () => {
    expect(new Set(pkg.versions).size).toBe(pkg.versions.length)
  })

  it('treats etcd and mysql as companions, not dependencies', () => {
    // Vitess stores topology in an external key-value store and manages MySQL
    // instances it does not provide; a cluster may point at an existing one
    // of either, so forcing them as dependencies would be wrong.
    expect(pkg.companions).toContain('etcd.io')
    expect(pkg.companions).toContain('mysql.com')
    expect(pkg.dependencies).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// mysql.com must only advertise versions it can actually build.
//
// A box installing `mysql.com` got a mysqld that could not start:
// "libicuuc.so.71: cannot open shared object file". The chain was:
// the catalog advertised 9.6.0, whose source tarball MySQL never publishes;
// the recipe therefore could not build it; and because mysql.com was not in
// the pkgx denylist the registry quietly served pkgx's vanilla binary
// instead - one built against an external ICU the registry does not carry,
// with every custom flag (bundled ICU, pantry openssl, libtirpc) dropped.
// ---------------------------------------------------------------------------

describe('mysql.com advertises only buildable versions', () => {
  const mysql = (pantry as any).mysqlcom

  it('advertises no 9.x innovation release', () => {
    // These are tagged but never published as source.
    for (const v of mysql.versions) expect(v.startsWith('9.')).toBe(false)
  })

  it('advertises the supported source and official native release families', () => {
    for (const version of mysql.versions) {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/)
      const [major, minor] = version.split('.')
      expect((major === '8' && ['0', '4'].includes(minor)) || Number(major) >= 26).toBe(true)
    }
  })

  it('is excluded from the pkgx fallback', async () => {
    // The registry must never substitute a vanilla build for this package:
    // it silently drops the flags that make it work.
    const src = await Bun.file(
      new URL('../../registry/src/pkgx-fallback.ts', import.meta.url).pathname,
    ).text()
    const block = src.slice(src.indexOf('CUSTOM_BUILD_DOMAINS'), src.indexOf('MaterializeResult'))
    expect(block).toContain(`'mysql.com'`)
  })
})

// ---------------------------------------------------------------------------
// mysql.com must ship an artifact that can actually be published.
//
// The build had no CMAKE_BUILD_TYPE, so MySQL's cmake defaulted to
// RelWithDebInfo and produced a 605MB tarball carrying full DWARF debug info
// plus the installed regression suite. It could not finish uploading inside
// the publish window, so mysql.com never shipped at all.
// ---------------------------------------------------------------------------

describe('mysql.com builds a publishable artifact', () => {
  const mysqlRecipe = () => mysqlRecipeModule.recipe
  const script = () => processScript(mysqlRecipe().build.script, [], 'linux-x86-64', '8.0.45')

  it('builds the legacy source family as Release, not the RelWithDebInfo cmake default', () => {
    expect(script()).toContain('-DCMAKE_BUILD_TYPE=Release')
  })

  it('does not install the legacy source regression suite', () => {
    expect(script()).toContain('-DWITH_TESTS=OFF')
    expect(script()).toContain('rm -rf {{prefix}}/mysql-test')
  })

  it('strips legacy source binaries that still carry symbols', () => {
    expect(script()).toContain('strip --strip-unneeded')
  })

  it('selects native vendor distributions without running the legacy compiler steps', () => {
    for (const version of ['8.4.11', '26.7.0']) {
      const native = processScript(mysqlRecipe().build.script, [], 'linux-x86-64', version)
      expect(native).toContain('cp -R ../bin ../include ../lib ../share ../support-files')
      expect(native).not.toContain('cmake ..')
    }
  })

  it('advertises nothing the build no longer produces', () => {
    // WITH_TESTS=OFF and WITH_ROUTER=OFF mean these binaries do not exist;
    // advertising them promises a tarball contents it does not have.
    for (const gone of [
      'mysqltest',
      'mysql_client_test',
      'mysqlxtest',
      'mysqltest_safe_process',
      'mysql_keyring_encryption_test',
      'mysqlrouter',
      'mysqlrouter_keyring',
      'mysqlrouter_passwd',
      'mysqlrouter_plugin_info',
    ]) {
      expect(mysqlRecipe().programs).not.toContain(gone)
      expect((pantry as any).mysqlcom.programs).not.toContain(gone)
    }
  })

  it('still advertises the server and client a deployment needs', () => {
    for (const required of ['mysqld', 'mysql', 'mysqladmin', 'mysqldump'])
      expect(mysqlRecipe().programs).toContain(required)
  })

  it('the catalog and the recipe advertise the same binaries', () => {
    expect([...(pantry as any).mysqlcom.programs].sort())
      .toEqual([...mysqlRecipe().programs].sort())
  })
})
