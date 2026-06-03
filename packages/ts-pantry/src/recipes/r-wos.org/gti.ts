import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'r-wos.org/gti',
  name: 'gti',
  programs: [
    'gti',
  ],
  distributable: {
    url: 'https://github.com/rwos/gti/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make gti',
      'mkdir -p "{{prefix}}"/bin',
      'mv gti "{{prefix}}"/bin',
    ],
  },
  test: {
    script: [
      'gti init',
    ],
  },
}
