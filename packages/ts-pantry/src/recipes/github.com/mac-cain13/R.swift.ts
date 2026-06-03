import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mac-cain13/R.swift',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'R',
  programs: [
    'rswift',
  ],
  distributable: {
    url: 'https://github.com/mac-cain13/R.swift/releases/download/{{version}}/rswift-{{version}}.zip',
  },
  build: {
    script: [
      'mv "$SRCROOT"/rswift .',
    ],
  },
}
