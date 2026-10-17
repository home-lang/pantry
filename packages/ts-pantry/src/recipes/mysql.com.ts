import type { Recipe } from '../../scripts/recipe-types'
import { mysqlCalendarVersions, mysqlDistributionUrl } from '../../scripts/mysql-distribution'

/** The supported 8.0 build keeps its existing source configuration. */
const legacySourceBuild: string[] = [
      // Use the pantry binutils `as` (>= 2.44, understands GCC 15's `.base64`)
      // instead of the host /usr/bin/as (2.42). -B makes GCC search this dir for
      // as/ld first; prepended so it wins.
      'export CFLAGS="-B{{deps.gnu.org/binutils.prefix}}/bin ${CFLAGS:-}"',
      'export CXXFLAGS="-B{{deps.gnu.org/binutils.prefix}}/bin ${CXXFLAGS:-}"',
      // Comment out the ARM -moutline-atomics STRING_APPEND (no-op match on x86).
      // The sed expression must be single-quoted; the previous backslash-escaped
      // form rendered to `\s/…` which sed rejects ("unknown command: `/`").
      'sed -i -e \'s/\\(STRING_APPEND.*moutline-atomics.*\\)/# \\1/\' ../CMakeLists.txt || true',
      // Strip inherited LTO flags at the source. GCC fat-LTO objects encode with
      // the `.base64` assembler directive that the build`s `as` rejects; the
      // cc-wrapper drops `-flto` per-invocation, but flags reach some bundled
      // sub-builds (zlib) another way — clearing CFLAGS/CXXFLAGS/LDFLAGS here means
      // cmake never puts `-flto` into CMAKE_*_FLAGS, so no compile ever sees it.
      'export CFLAGS="$(echo "${CFLAGS:-}" | sed -E \'s/-flto[^ ]*//g; s/-ffat-lto-objects//g\')"',
      'export CXXFLAGS="$(echo "${CXXFLAGS:-}" | sed -E \'s/-flto[^ ]*//g; s/-ffat-lto-objects//g\')"',
      'export LDFLAGS="$(echo "${LDFLAGS:-}" | sed -E \'s/-flto[^ ]*//g; s/-ffat-lto-objects//g\')"',
      // Plain command strings — a leading `run:` is NOT stripped by buildkit
      // (that's the object-step form `{ run: … }`), it would emit a literal
      // `run:` into the script ("run:: command not found").
      'export ARGS="$(echo $ARGS | sed \'s/WITH_ZLIB=system/WITH_ZLIB=bundled/g\')"',
      // Install into the pantry prefix; MySQL otherwise defaults to
      // /usr/local/mysql and `make install` fails (no write permission).
      'export ARGS="$ARGS -DCMAKE_INSTALL_PREFIX={{prefix}}"',
      'export ARGS="$ARGS -DCMAKE_C_STANDARD=17"',
      // MySQL's cmake defaults to RelWithDebInfo when no build type is given,
      // and nothing here was giving one. The result carried full DWARF debug
      // info: a 605MB artifact that could not finish uploading inside the
      // publish window, so mysql.com never actually shipped. Nothing at
      // runtime reads those symbols.
      'export ARGS="$ARGS -DCMAKE_BUILD_TYPE=Release"',
      // Don't build or install the test suite. `make install` otherwise lays
      // down mysql-test/ (the full regression corpus, hundreds of megabytes of
      // .test/.result fixtures) into the package a deployment installs.
      'export ARGS="$ARGS -DWITH_TESTS=OFF -DWITH_ROUTER=OFF"',
      // Use pantry deps for SSL + ICU so the runtime binary doesn't depend on
      // the build host's system libs.
      // openssl from pantry (soname-stable so.3); ICU bundled (static) so mysqld
      // has no external libicuuc.so.<major> the registry can't version-match.
      // `-DWITH_SSL=system`, not a `{{deps.openssl.org.prefix}}` template.
      // That placeholder was never substituted - it reached cmake verbatim,
      // which failed with "Wrong option or path for
      // WITH_SSL={{deps.openssl.org.prefix}}" and killed every build. So the
      // fix this recipe was written to make (link current openssl/ICU instead
      // of the long-gone libssl.so.1.1 and libicuuc.so.71) never actually
      // shipped, and the registry kept serving the broken artifact.
      //
      // CMake discovers OpenSSL through the managed dependency environment.
      // The OpenSSL 3 ABI matches the declared runtime dependency.
      // ICU stays bundled because its soname carries the
      // major version (libicuuc.so.<major>) and the registry only ever
      // carries one ICU, so an external link cannot be version-matched.
      'export ARGS="$ARGS -DWITH_SSL=system -DWITH_ICU=bundled"',
      // The mysql-boost tarball bundles the exact boost MySQL needs at <src>/boost.
      'export ARGS="$ARGS -DWITH_BOOST=../boost"',
      // Skip the bundled googletest unit tests: a build-tool dep (ninja) puts its
      // own gtest headers on CPATH, which shadow MySQL's vendored googletest and
      // break the gmock/gtest compile. The server doesn't need unit tests.
      'export ARGS="$ARGS -DWITH_UNIT_TESTS=OFF"',
      // Use MySQL's vendored protobuf 24.4 (source + its own protoc). A pantry
      // protobuf (v21) on CPATH otherwise shadows the bundled headers and the
      // generated .pb.cc fails to compile ("ClassData does not name a type").
      // The pantry protobuf dep is removed from the catalog so it isn't installed.
      'export ARGS="$ARGS -DWITH_PROTOBUF=bundled"',
      // Disable LTO/IPO entirely. MySQL (and/or CMake IPO) enable -flto, whose
      // GCC fat-LTO `.base64` assembly the build`s `as` rejects; WITH_LTO=OFF +
      // INTERPROCEDURAL_OPTIMIZATION=OFF keep it off for every target (the bundled
      // zlib was getting -flto via IPO, bypassing the CFLAGS/wrapper scrubbing).
      'export ARGS="$ARGS -DWITH_LTO=OFF -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=OFF"',
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}} install',
      // MySQL installs its bundled shared libs (e.g. libprotobuf-lite.so) into
      // <prefix>/lib/private with an $ORIGIN rpath. pantry's `pantry env` only
      // adds <pkg>/lib (not lib/private) to LD_LIBRARY_PATH, so mysqld can't find
      // them at runtime. Hoist them into <prefix>/lib so they resolve.
      'if [ -d {{prefix}}/lib/private ]; then mv {{prefix}}/lib/private/*.so* {{prefix}}/lib/ 2>/dev/null || true; fi',
      'if [ -d {{prefix}}/lib/mysql/private ]; then mv {{prefix}}/lib/mysql/private/*.so* {{prefix}}/lib/ 2>/dev/null || true; fi',
      // Belt and braces against the size problem above: strip anything that
      // still carries symbols, and drop the directories `make install` adds
      // that no running server reads. Both are guarded - a stray failure here
      // must not fail an otherwise good build.
      'find {{prefix}}/bin {{prefix}}/lib -type f \\( -perm -u+x -o -name "*.so*" \\) -exec strip --strip-unneeded {} + 2>/dev/null || true',
      'rm -rf {{prefix}}/mysql-test {{prefix}}/share/doc {{prefix}}/docs {{prefix}}/man {{prefix}}/share/man',
]


export const recipe: Recipe = {
  domain: 'mysql.com',
  name: 'mysql',
  description: 'MySQL Community Server and client tools.',
  homepage: 'https://www.mysql.com/',
  github: 'https://github.com/mysql/mysql-server',
  // Trimmed to what a deployment runs. The test harnesses MySQL builds
  // (mysqltest, mysql_client_test, mysqlxtest, ...) are no longer built at all
  // (-DWITH_TESTS=OFF), so advertising them would promise binaries the tarball
  // does not contain. Router likewise: it is a separate product, and Vitess
  // supersedes it here.
  programs: ['my_print_defaults', 'myisam_ftdump', 'myisamchk', 'myisamlog', 'myisampack', 'mysql', 'mysql_config', 'mysql_config_editor', 'mysql_migrate_keyring', 'mysql_secure_installation', 'mysql_tzinfo_to_sql', 'mysqladmin', 'mysqlbinlog', 'mysqlcheck', 'mysqld', 'mysqld_multi', 'mysqld_safe', 'mysqldump', 'mysqldumpslow', 'mysqlimport', 'mysqlshow', 'mysqlslap'],
  // Calendar releases ship official per-platform runtime archives. Older 8.0
  // releases retain the source build that supplies their supported ABI.
  platforms: ['darwin', 'linux'],
  versionSource: {
    type: 'custom',
    fetch: async () => {
      const calendar = await mysqlCalendarVersions()
      // Keep the supported 8.0 source archives alongside verified modern
      // server distributions; Cluster tags never imply a server artifact.
      const FLOOR = 43 // 8.0.43, the oldest release this recipe is known to build
      const MAX_PROBES = 24
      const STOP_AFTER_MISSES = 3

      const exists = async (version: string): Promise<boolean> => {
        try {
          const res = await fetch(
            `https://cdn.mysql.com/archives/mysql-8.0/mysql-boost-${version}.tar.gz`,
            { method: 'HEAD', signal: AbortSignal.timeout(15_000) },
          )
          return res.ok
        }
        catch {
          return false
        }
      }

      const found: string[] = []
      let misses = 0
      for (let patch = FLOOR; patch < FLOOR + MAX_PROBES && misses < STOP_AFTER_MISSES; patch++) {
        const version = `8.0.${patch}`
        // eslint-disable-next-line no-await-in-loop
        if (await exists(version)) {
          found.push(version)
          misses = 0
        }
        else {
          misses++
        }
      }

      // Never hand back an empty catalog on a bad network day: removing the
      // package outright is worse than serving the last known-good release.
      return [...calendar, ...(found.length > 0 ? found.reverse() : [`8.0.${FLOOR}`])]
    },
  },

  distributable: {
    url: mysqlDistributionUrl,
    stripComponents: 1,
  },

  // Link against pantry-built libs so the binary runs on a clean box. The
  // published mirror needed libssl.so.1.1 / libicuuc.so.71 (long gone); pin the
  // current majors and point cmake at them (WITH_SSL / WITH_ICU).
  dependencies: {
    // openssl 3.x is soname-stable (libssl.so.3), so the pantry dep matches at
    // runtime. ICU is NOT (libicuuc.so.<major>): the registry only carries the
    // latest ICU, so a build pinned to .so.73 won't load — ICU is bundled
    // statically instead (see -DWITH_ICU=bundled).
    'openssl.org': '^3',
    'perl.org': '^5',
    'gnu.org/ncurses': '^6',
    // Sun RPC (rpc/rpc.h) was dropped from glibc >= 2.32; MySQL's
    // MYSQL_CHECK_RPC needs it. libtirpc provides it (header at
    // <prefix>/include/tirpc, lib libtirpc.so.3), declared so the runtime dep
    // resolves on the box. Source builds obtain headers from this dependency.
    //
    // The linux scope is load-bearing rather than tidiness: macOS has Sun RPC
    // in its own libc and the registry carries no darwin libtirpc, so declaring
    // it for every platform made `pantry install mysql.com` fail on every Mac
    // with "package sourceforge.net/libtirpc@1.3.7 not found in registry" - a
    // dependency that platform neither has nor needs.
    linux: {
      'sourceforge.net/libtirpc': '*',
      'pagure.io/libaio': '^0.3.113',
      'github.com/numactl/numactl': '^2',
      'gnu.org/gcc/libstdcxx': '14',
    },
  },

  // Compiler dependencies belong only to the legacy source build. Native
  // runtime distributions do not inherit an unnecessary compiler toolchain.
  dependencyOverrides: [{
    if: '<26.0.0',
    buildDependencies: {
      'gnu.org/binutils': '*',
      'cmake.org': '^3',
      'gnu.org/bison': '>=3.0.4',
    },
  }],

  build: {
    'working-directory': 'build',
    script: [
      {
        if: '>=26.0.0',
        run: [
          'mkdir -p "{{prefix}}"',
          'cp -R ../bin ../include ../lib ../share ../support-files "{{prefix}}/"',
          'for file in ../LICENSE* ../README*; do if [ -f "$file" ]; then cp "$file" "{{prefix}}/"; fi; done',
        ],
      },
      ...legacySourceBuild.map(run => ({ run, if: '<26.0.0' })),
    ],
  },
  test: {
    required: true,
    script: ['mysql --version | grep -F "{{version}}"', 'mysqld --version | grep -F "{{version}}"'],
  },
}
