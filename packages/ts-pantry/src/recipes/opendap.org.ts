import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opendap.org',
  name: 'opendap',
  description: 'A new version of libdap that contains both DAP2 and DAP4 support',
  homepage: 'https://www.opendap.org/',
  github: 'https://github.com/OPENDAP/libdap4',
  programs: ['dap-config', 'dap-config-pkgconfig', 'getdap', 'getdap4'],
  versionSource: {
    type: 'github-releases',
    repo: 'OPENDAP/libdap4',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.opendap.org/pub/source/libdap-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/libxml2': '*',
    'openssl.org': '*',
    'curl.se': '*',
    linux: {
      'sourceforge.net/libtirpc': '*',
      'github.com/util-linux/util-linux': '*',
    },
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'freedesktop.org/pkg-config': '*',
    'github.com/westes/flex': '*',
    'gnu.org/patch': '*',
    linux: {
      'gnu.org/autoconf': '*',
      'gnu.org/automake': '*',
      'gnu.org/libtool': '*',
    },
  },

  build: {
    script: [
      'curl $PATCH | patch -p1 || true',
      { run: 'autoreconf --force --install --verbose', if: 'linux' },
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} check',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      darwin: {
        PATCH: 'https://raw.githubusercontent.com/Homebrew/formula-patches/03cf8088210822aa2c1ab544ed58ea04c897d9c4/libtool/configure-big_sur.diff',
      },
      linux: {
        PATCH: 'https://github.com/OPENDAP/libdap4/commit/48b44b96faf1ed1e44f118828c3de903fff0a276.patch?full_index=1',
      },
      ARGS: ['--prefix={{prefix}}', '--disable-dependency-tracking', '--disable-debug', '--with-included-regex'],
    },
  },
}
