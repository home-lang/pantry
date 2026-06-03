import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libSM',
  name: 'libSM',
  programs: [],
  dependencies: {
    'x.org/ice': '*',
  },
  buildDependencies: {
    'x.org/xtrans': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libSM-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--sysconfdir={{prefix}}/etc',
        '--localstatedir={{prefix}}/var',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--enable-docs=no',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -o test',
      './test',
      'pkg-config --modversion sm | grep {{version}}',
    ],
  },
}
