import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'arkade.dev',
  name: 'Arkade',
  description: 'Open Source Marketplace For Developer Tools',
  homepage: 'https://blog.alexellis.io/kubernetes-marketplace-two-year-update/',
  github: 'https://github.com/alexellis/arkade',
  programs: ['arkade'],
  versionSource: {
    type: 'github-releases',
    repo: 'alexellis/arkade/releases/tags',
  },
  distributable: {
    url: 'git+https://github.com/alexellis/arkade',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o "{{prefix}}"/bin/arkade',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X github.com/alexellis/arkade/pkg.Version={{version}}', '-X github.com/alexellis/arkade/pkg.GitCommit=$(git rev-parse HEAD)"'],
    },
  },
}
