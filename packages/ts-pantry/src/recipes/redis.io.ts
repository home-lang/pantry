import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'redis.io',
  name: 'redis',
  description: 'Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps.',
  homepage: 'https://redis.io',
  github: 'https://github.com/redis/redis',
  programs: ['redis-server', 'redis-cli', 'redis-benchmark'],
  versionSource: {
    type: 'github-releases',
    repo: 'redis/redis',
  },
  distributable: {
    url: 'https://download.redis.io/releases/redis-{{version}}.tar.gz',
    stripComponents: 1,
  },
  // New source builds bundle OpenSSL 3 through the recipe/fix-up step. Keep
  // the catalog's OpenSSL 1.1 runtime dependency for older published artifacts.
  // A build dependency must not replace that ABI in the generated registry.
  buildDependencies: {
    'openssl.org': '^3',
  },

  build: {
    script: [
      // `install` depends on `all`, and `all` depends on `module_tests`, which
      // recurses into tests/modules — test fixtures we never ship. That sub-make
      // links with `$(LD)`, and on Darwin nothing reassigns LD (redis only sets
      // `LD = gcc` inside its `ifeq ($(uname_S),Linux)` branch), so it invokes
      // the RAW linker. Our LDFLAGS carry `-Wl,-rpath,...`, which is a compiler-
      // driver option, and raw ld rejects it:
      //   ld: unknown option: -Wl,-rpath,/tmp/buildkit-deps-redis.io/openssl.org/...
      // The server, sentinel, cli and benchmark had all linked fine by then; the
      // whole darwin build failed on test fixtures. Drop them from `all` — we
      // never install them, so not building them is strictly correct, and the
      // edit is scoped to that one target so `module_tests:` itself and the
      // `test:` target keep working for anyone running them.
      "sed -i.bak 's/^\\(all:.*\\) module_tests$/\\1/' src/Makefile",
      // PREFIX goes on the make COMMAND LINE, not in the environment. Redis
      // 8.10.1's top-level Makefile ignores an environment PREFIX and installs
      // to /usr/local/bin regardless. Locally that fails loudly with
      // "mkdir: /usr/local/bin: Permission denied"; on a CI runner /usr/local
      // IS writable, so `make install` exits 0 having put the binaries
      // somewhere we never look, and the build fails one step later with
      // "Build produced no files in /tmp/buildkit-install-redis.io" — with
      // nothing in the log pointing at the cause. A command-line variable
      // beats both the environment and any makefile assignment, so this cannot
      // be overridden again.
      'make install PREFIX={{prefix}}',
      {
        // Ship the OpenSSL 3 runtime alongside the binary, exactly as curl.se
        // does. BUILD_TLS=yes links libssl/libcrypto, and this recipe builds
        // against OpenSSL 3, so a source-built redis-server needs libssl.so.3.
        // The package's declared RUNTIME dependency is openssl.org^1.1 —
        // correct for the older versions, which are pkgx mirrors linking
        // libssl.so.1.1, and wrong for anything we compile ourselves. One
        // dependency list cannot describe both, so the artifact we control is
        // made self-sufficient instead.
        //
        // This is not hypothetical: 8.10.1 published linking libssl.so.3 while
        // 8.10.0 links libssl.so.1.1 and the metadata still says ^1.1.
        run: [
          'mkdir -p {{prefix}}/lib',
          'cp -L {{deps.openssl.org.prefix}}/lib/libssl.so.3 {{prefix}}/lib/',
          'cp -L {{deps.openssl.org.prefix}}/lib/libcrypto.so.3 {{prefix}}/lib/',
        ],
        if: 'linux',
      },
    ],
    env: {
      // BUILD_TLS is read from the environment correctly (it lands in redis's
      // .make-settings), so it stays here.
      'BUILD_TLS': 'yes',
      // Pin it off rather than letting redis decide. `ifneq ($(USE_SYSTEMD),no)`
      // auto-detects libsystemd via pkg-config, and the ubuntu runner happens to
      // have libsystemd-dev, so the published 8.10.1 came out with
      // `DT_NEEDED libsystemd.so.0` — an external library we neither bundle nor
      // declare, picked up purely from whatever was on the build host. It is not
      // caught by the health check either: the check runs ON that host, where
      // the library obviously resolves. The only thing it buys is `supervised
      // systemd` mode, which a pantry-installed redis does not use, and the cost
      // is a binary that will not start on anything without systemd.
      'USE_SYSTEMD': 'no',
    },
  },
  // Required, and with the library-path variables stripped: on the build host
  // the OpenSSL dep dir is still on the loader path, so a test that kept them
  // would pass even when the artifact cannot stand on its own. Unsetting them
  // is what makes this a real check that the bundled libs plus the rpath
  // fix-up are enough — and it turns "ships a binary that cannot exec" from a
  // silent publish into a failed build.
  test: {
    required: true,
    script: [
      'env -u LD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH {{prefix}}/bin/redis-server --version',
    ],
  },
}
