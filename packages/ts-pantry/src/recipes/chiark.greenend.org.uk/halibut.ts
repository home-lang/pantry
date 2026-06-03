import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'chiark.greenend.org.uk/halibut',
  name: 'halibut',
  programs: [
    'halibut',
  ],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://www.chiark.greenend.org.uk/~sgtatham/halibut/halibut-{{version.marketing}}/halibut-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX:PATH="{{prefix}}"',
      ],
    },
  },
}
