import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/uchardet',
  name: 'uchardet',
  programs: [
    'uchardet',
  ],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://www.freedesktop.org/software/uchardet/releases/uchardet-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
    },
  },
}
