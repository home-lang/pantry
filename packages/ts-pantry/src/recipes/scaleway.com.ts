import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'scaleway.com',
  name: 'scw',
  description: 'Command Line Interface for Scaleway',
  homepage: 'https://www.scaleway.com/en/cli/',
  github: 'https://github.com/scaleway/scaleway-cli',
  programs: ['scw'],
  versionSource: {
    type: 'github-releases',
    repo: 'scaleway/scaleway-cli',
  },
  distributable: {
    url: 'https://github.com/scaleway/scaleway-cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.24.6',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/scw .',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X main.GitCommit=pkgx', '-X main.GitBranch=pantry', '-X main.BuildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')', '-X main.Version={{version}}'],
    },
  },
}
