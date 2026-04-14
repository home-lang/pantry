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

  distributable: {
    url: 'https://github.com/golangci/golangci-lint/releases/download/v{{version}}/golangci-lint-{{version}}-darwin-arm64.tar.gz',
  },

  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      'cp golangci-lint {{prefix}}/bin/',
    ],
  },
}
