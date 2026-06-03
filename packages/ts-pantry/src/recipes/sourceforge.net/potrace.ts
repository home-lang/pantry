import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/potrace',
  name: 'potrace',
  programs: [
    'potrace',
    'mkbitmap',
  ],
  dependencies: {
    'zlib.net': '^1',
  },
  distributable: {
    url: 'https://potrace.sourceforge.net/download/{{version.marketing}}/potrace-{{version.marketing}}.tar.gz',
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
        '--prefix={{prefix}}',
        '--with-libpotrace',
      ],
    },
  },
  test: {
    script: [
      'curl -L https://potrace.sourceforge.net/img/head.pbm -o head.pbm',
      'potrace head.pbm -o test.eps',
      'ls | grep test.eps',
      'potrace --version | grep {{version.marketing}}',
    ],
  },
}
