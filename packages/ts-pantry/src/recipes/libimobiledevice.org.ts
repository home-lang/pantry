import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libimobiledevice.org',
  name: 'idevicedate',
  description: 'A cross-platform protocol library to communicate with iOS devices',
  homepage: 'https://www.libimobiledevice.org/',
  github: 'https://github.com/libimobiledevice/libimobiledevice',
  programs: ['idevicedate'],
  versionSource: {
    type: 'github-releases',
    repo: 'libimobiledevice/libimobiledevice',
  },
  distributable: {
    url: 'https://github.com/libimobiledevice/libimobiledevice/releases/download/{{version}}/libimobiledevice-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'libimobiledevice.org/libplist': '^2.4',
    'libimobiledevice.org/libtatsu': '^1',
    'libimobiledevice.org/libimobiledevice-glue': '^1.3',
    'gnu.org/libtasn1': '^4.19',
    'libimobiledevice.org/libusbmuxd': '^2',
    'openssl.org': '^1.1',
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
      'sed -i \'s|PLIST_FORMAT_XML|PLIST_FORMAT_XML_|g\' common/utils.h',
      'sed -i \'s|PLIST_FORMAT_BINARY|PLIST_FORMAT_BINARY_|g\' common/utils.h',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--disable-debug', '--disable-dependency-tracking', '--disable-silent-rules', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--enable-debug', '--without-cython'],
    },
  },
}
