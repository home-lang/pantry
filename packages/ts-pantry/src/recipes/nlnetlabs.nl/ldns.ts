import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nlnetlabs.nl/ldns',
  name: 'ldns',
  programs: [
    'drill',
    'ldns-config',
  ],
  dependencies: {
    'openssl.org': '^1',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'swig.org': '*',
  },
  distributable: {
    url: 'https://nlnetlabs.nl/downloads/ldns/ldns-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '# Oddly, the man pages are read-only, messing',
      '# up our build process',
      'find {{ prefix }}/share/man -type f -print0 | xargs -0 chmod u+w',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-drill',
        '--with-ssl={{ deps.openssl.org.prefix }}',
        '--disable-dane-verify',
        '--without-xcode-sdk',
      ],
      CFLAGS: '$CFLAGS -I$(pwd)/ldns',
    },
  },
}
