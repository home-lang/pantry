import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mtoyoda/sl',
  propsDir: '../../props/github.com/mtoyoda/sl',
  name: 'sl',
  programs: [
    'sl',
  ],
  dependencies: {
    'invisible-island.net/ncurses': 6,
  },
  buildDependencies: {
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://github.com/mtoyoda/sl/archive/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '# Add -v to allow testing resultant binary',
      'patch -p1 < props/version.patch',
      'make',
      'mkdir -p {{prefix}}/bin',
      'mv sl {{prefix}}/bin',
    ],
    env: {
      TEA_VERSION: '${{ version }}',
    },
  },
}
