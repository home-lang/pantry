import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'developers.yubico.com/libfido2',
  name: 'libfido2',
  programs: [
    'fido2-assert',
    'fido2-cred',
    'fido2-token',
  ],
  dependencies: {
    'github.com/PJK/libcbor': 0,
    'openssl.org': 1,
    'zlib.net': 1,
    linux: {
      'systemd.io': '*',
    },
  },
  buildDependencies: {
    'cmake.org': 3,
    'freedesktop.org/pkg-config': '^0.29',
  },
  distributable: {
    url: 'https://developers.yubico.com/libfido2/Releases/libfido2-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}"',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c -o test -lfido2',
      './test',
    ],
  },
}
