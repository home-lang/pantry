import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pre-commit.com',
  name: 'pre-commit',
  description: 'A framework for managing and maintaining multi-language pre-commit hooks.',
  homepage: 'https://pre-commit.com/',
  github: 'https://github.com/pre-commit/pre-commit',
  programs: ['pre-commit'],
  versionSource: {
    type: 'github-releases',
    repo: 'pre-commit/pre-commit',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/pre-commit/pre-commit/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      '  repo: https://github.com/pre-commit/pre-commit-hooks',
    ],
  },
}
