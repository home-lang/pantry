import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ColinIanKing/stress-ng',
  name: 'stress-ng',
  programs: [
    'stress-ng',
  ],
  dependencies: {
    'github.com/besser82/libxcrypt': '*',
    'zlib.net': '*',
  },
  distributable: {
    url: 'https://github.com/ColinIanKing/stress-ng/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s|/usr|{{ prefix }}|g\' Makefile',
      'make -j {{ hw.concurrency }}',
      'make install',
    ],
  },
  test: {
    script: [
      'stress-ng -c 1 -t 1 2>&1 | tee out.log',
      'grep \'successful run completed\' out.log',
    ],
  },
}
