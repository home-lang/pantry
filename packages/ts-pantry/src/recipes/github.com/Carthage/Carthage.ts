import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Carthage/Carthage',
  name: 'Carthage',
  programs: [
    'carthage',
  ],
  distributable: {
    url: 'https://github.com/Carthage/Carthage/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make prefix_install PREFIX={{prefix}}',
    ],
  },
  test: {
    script: [
      'carthage version | grep {{version}}',
    ],
  },
}
