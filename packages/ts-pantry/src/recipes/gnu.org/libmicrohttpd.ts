import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libmicrohttpd',
  name: 'libmicrohttpd',
  programs: [],
  dependencies: {
    'gnu.org/libunistring': '^1',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libmicrohttpd/libmicrohttpd-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lmicrohttpd -o test',
      './test &',
      'echo $! > test.pid',
      'sleep 1',
      'curl -L http://localhost:8888/ | grep \'namepost\'',
      'kill $(cat test.pid)',
    ],
  },
}
