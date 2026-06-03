import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/markuskimius/SDL2_Pango',
  name: 'SDL2_Pango',
  programs: [],
  dependencies: {
    'gnome.org/pango': '>=1.2',
    'libsdl.org': '^2.0.2',
  },
  distributable: {
    url: 'https://github.com/markuskimius/SDL2_Pango/archive/refs/tags/v{{version}}.tar.gz',
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
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE -lSDL2_Pango',
      './a.out',
    ],
  },
}
