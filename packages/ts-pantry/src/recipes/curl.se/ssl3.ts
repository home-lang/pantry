import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'curl.se/ssl3',
  name: 'ssl3',
  programs: [],
  dependencies: {
    'openssl.org': '^3',
    'curl.se/ca-certs': '*',
    'zlib.net': '^1.2.11',
    'nghttp2.org': '*',
  },
  distributable: {
    url: 'https://curl.se/download/curl-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-openssl',
        '--without-libpsl',
        '--with-ca-fallback',
        '--with-nghttp2',
      ],
    },
  },
  test: {
    script: [
      'curl -i pkgx.sh',
      'curl --proto \'=https\' --tlsv1.2 -sSf https://get-ghcup.haskell.org',
    ],
  },
}
