import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'git-town.com',
  name: 'git-town',
  description: 'High-level command-line interface for Git',
  homepage: 'https://www.git-town.com/',
  github: 'https://github.com/git-town/git-town',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'git-town/git-town',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/git-town/git-town/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'sed -i \\/charmbracelet\\/x\\/ansi/d\\ go.sum',
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \\{{prefix}}/bin/git-town\\ .',
    ],
  },
}
