import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/lm-sensors/lm-sensors',
  platforms: ['linux'],
  name: 'lm-sensors',
  programs: [
    'sensors',
  ],
  buildDependencies: {
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/lm-sensors/lm-sensors/archive/V{{version.major}}-{{version.minor}}-{{version.patch}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $ARGS',
      'make $ARGS install',
    ],
    env: {
      ARGS: [
        'PREFIX={{prefix}}',
        'BUILD_STATIC_LIB=0',
        'MANDIR={{prefix}}/man',
        'ETCDIR={{prefix}}/etc',
      ],
    },
  },
  test: {
    script: [
      'sensors --version | grep {{version}}',
    ],
  },
}
