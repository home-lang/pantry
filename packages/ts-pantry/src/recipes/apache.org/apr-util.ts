import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apache.org/apr-util',
  name: 'apu-{{ version.major }}-config',
  description: 'Mirror of Apache Portable Runtime util',
  github: 'https://github.com/apache/apr-util',
  programs: ['apu-{{ version.major }}-config'],
  // apr-util links against apr at build and runtime; expat/sqlite/openssl are
  // optional backends that pkgx wires in at build time.
  dependencies: {
    'apache.org/apr': '*',
  },
  buildDependencies: {
    'apache.org/apr': '*',
    'openssl.org': '*',
    'libexpat.github.io': '*',
    'sqlite.org': '*',
  },
  versionSource: {
    type: 'github-tags',
    repo: 'apache/apr-util',
  },
  distributable: {
    url: 'https://dlcdn.apache.org/apr/apr-util-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      // apr-util inherits CC/CPP from the apr install it builds against
      // (apr_rules.mk / apr-1-config). When apr was built in a different sandbox
      // (e.g. a Hetzner box at /root/pantry-build/... vs this runner's /tmp/pb-*),
      // the recorded "<other-sandbox>/_cc_wrapper/cc -E" preprocessor path does not
      // exist here, so configure's C-preprocessor sanity check fails with
      // "cc: unrecognized command-line option '-version'". Defensively scrub any
      // stale wrapper path out of the apr install we depend on, then pin CC/CPP to
      // this sandbox's compiler so the inherited value can't leak in.
      'find "{{deps.apache.org/apr.prefix}}" -type f \\( -name apr_rules.mk -o -name "apr-*-config" -o -name apr.exp -o -name "*.mk" \\) -exec sed -i -E "s#/[^ \\"=]*/_cc_wrapper/cc#cc#g; s#/[^ \\"=]*pantry-build[^ \\"=]*/cc#cc#g" {} + 2>/dev/null || true',
      'export CC="${CC:-$(command -v cc || command -v gcc)}"',
      'export CPP="$CC -E"',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-apr={{deps.apache.org/apr.prefix}}',
        '--includedir={{prefix}}/include',
        '--with-expat={{deps.libexpat.github.io.prefix}}',
        '--with-openssl={{deps.openssl.org.prefix}}',
        '--with-sqlite3={{deps.sqlite.org.prefix}}',
      ],
    },
  },

  test: {
    script: [
      'test "$(apu-{{version.major}}-config --version)" = {{version}}',
    ],
  },
}
