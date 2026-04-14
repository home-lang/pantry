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
    tagPattern: /^elements-(.+)$/,
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
  },

  build: {
    script: [
      'if ! command -v glibtool &>/dev/null; then',
      '  BREW_LIBTOOL="$(brew --prefix libtool 2>/dev/null)/bin"',
      '  if [ -f "$BREW_LIBTOOL/glibtool" ]; then',
      '    export PATH="$BREW_LIBTOOL:$PATH"',
      '  fi',
      'fi',
      '# Ensure aclocal can find libtool M4 macros (needed for autoreconf)',
      'BREW_LT_SHARE="$(brew --prefix libtool 2>/dev/null)/share/aclocal"',
      'if [ -d "$BREW_LT_SHARE" ]; then',
      '  export ACLOCAL_PATH="${BREW_LT_SHARE}${ACLOCAL_PATH:+:$ACLOCAL_PATH}"',
      'fi',
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'CXX': 'c++',
      'ARGS': ['--prefix="{{prefix}}"', '--with-incompatible-bdb', '--enable-liquid', '--with-boost={{deps.boost.org.prefix}}', '--without-bdb'],
    },
  },
}
