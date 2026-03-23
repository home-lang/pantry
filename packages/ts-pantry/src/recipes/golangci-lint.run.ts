import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'golangci-lint.run',
  name: 'golangci-lint',
  description: 'Fast linters runner for Go',
  homepage: 'https://golangci-lint.run/',
  github: 'https://github.com/golangci/golangci-lint',
  programs: ['', '', '', '', '', '', '', '', '', ''],
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
