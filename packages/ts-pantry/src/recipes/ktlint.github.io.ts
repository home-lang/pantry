import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ktlint.github.io',
  name: 'ktlint',
  description: 'An anti-bikeshedding Kotlin linter with built-in formatter',
  homepage: 'https://ktlint.github.io/',
  github: 'https://github.com/pinterest/ktlint',
  programs: ['ktlint'],
  versionSource: {
    type: 'github-releases',
    repo: 'pinterest/ktlint',
  },
  distributable: {
    url: 'https://github.com/pinterest/ktlint/releases/download/{{version}}/ktlint-{{version}}.zip',
  },
  dependencies: {
    'openjdk.org': '*',
  },

  build: {
    script: [
      'install -D ktlint-{{version}}/bin/ktlint {{prefix}}/bin/ktlint',
    ],
  },
}
