import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/util-macros',
  name: 'util-macros',
  programs: [],
  distributable: {
    url: 'https://www.x.org/archive/individual/util/util-macros-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --exists xorg-macros',
    ],
  },
}
