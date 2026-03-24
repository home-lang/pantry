import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'golangci-lint.run',
  name: 'golangci-lint',
  description: 'Fast linters runner for Go',
  homepage: 'https://golangci-lint.run/',
  github: 'https://github.com/golangci/golangci-lint',
  programs: ['golangci-lint'],
  versionSource: {
    type: 'github-releases',
    repo: 'golangci/golangci-lint',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'echo "Build not yet configured for golangci-lint.run"',    ],
  },
}
