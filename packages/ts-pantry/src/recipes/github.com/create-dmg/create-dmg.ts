import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/create-dmg/create-dmg',
  name: 'create-dmg',
  programs: [
    'create-dmg',
  ],
  platforms: ['darwin'],
  distributable: {
    url: 'https://github.com/create-dmg/create-dmg/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make prefix={{prefix}} install',
    ],
  },
}
