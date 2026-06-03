import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kylef/swiftenv',
  name: 'swiftenv',
  programs: [
    'swiftenv',
  ],
  distributable: {
    url: 'https://github.com/kylef/swiftenv/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cp -a "$SRCROOT"/* .',
    ],
  },
}
