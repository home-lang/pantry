import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'elementsproject.org',
  name: 'elementsproject',
  description: 'Open Source implementation of advanced blockchain features extending the Bitcoin protocol',
  github: 'https://github.com/ElementsProject/elements',
  programs: ['bench_bitcoin', 'elements-cli', 'elements-tx', 'elements-util', 'elements-wallet', 'elementsd', 'test_bitcoin'],
  versionSource: {
    type: 'github-releases',
    repo: 'ElementsProject/elements',
    // Match only stable semver tags (e.g. elements-23.2.6); skip rc/pre tags.
    tagPattern: /^elements-(\d[\d.]*)$/,
    stable: true,
  },
  distributable: {
    url: 'https://github.com/ElementsProject/elements/archive/refs/tags/elements-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'boost.org': '^1.64',
    'libevent.org': '*',
    'oracle.com/berkeley-db': '*',
  },
  buildDependencies: {
    'gnu.org/automake': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    // pkgx: hexdump (provided by util-linux) is required on Linux during the build
    linux: {
      'github.com/util-linux/util-linux': '*',
    },
  },

  build: {
    script: [
      'if ! command -v glibtool &>/dev/null; then',
      '  BREW_LIBTOOL="$(brew --prefix libtool 2>/dev/null)/bin"',
      '  if [ -f "$BREW_LIBTOOL/glibtool" ]; then',
      '    export PATH="$BREW_LIBTOOL:$PATH"',
      '  fi',
      'fi',
      '# autoreconf runs aclocal, which must locate the M4 macros shipped by the',
      '# pkg-config (pkg.m4 -> PKG_PROG_PKG_CONFIG), libtool, and automake build',
      '# deps. On the Linux CI runner these come from the pantry dep prefixes',
      '# rather than brew, so collect every plausible aclocal dir for ACLOCAL_PATH.',
      'for _ac_share in \\',
      '  "{{deps.freedesktop.org/pkg-config.prefix}}/share/aclocal" \\',
      '  "{{deps.gnu.org/libtool.prefix}}/share/aclocal" \\',
      '  "{{deps.gnu.org/automake.prefix}}/share/aclocal" \\',
      '  "{{deps.gnu.org/autoconf.prefix}}/share/aclocal" \\',
      '  "$(brew --prefix pkg-config 2>/dev/null)/share/aclocal" \\',
      '  "$(brew --prefix libtool 2>/dev/null)/share/aclocal" \\',
      '  /usr/share/aclocal \\',
      '  /usr/local/share/aclocal; do',
      '  if [ -d "$_ac_share" ]; then',
      '    case ":${ACLOCAL_PATH:-}:" in *":$_ac_share:"*) ;; *) export ACLOCAL_PATH="${_ac_share}${ACLOCAL_PATH:+:$ACLOCAL_PATH}" ;; esac',
      '  fi',
      'done',
      '# Ensure configure can resolve pkg-config-provided deps (libevent, etc.).',
      'export PKG_CONFIG_PATH="{{deps.libevent.org.prefix}}/lib/pkgconfig${PKG_CONFIG_PATH:+:$PKG_CONFIG_PATH}"',
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'CXX': 'c++',
      'ARGS': ['--prefix={{prefix}}', '--with-incompatible-bdb', '--enable-liquid', '--with-boost={{deps.boost.org.prefix}}'],
    },
  },
}
