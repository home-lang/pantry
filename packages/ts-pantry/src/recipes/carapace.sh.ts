import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'carapace.sh',
  name: 'carapace',
  description: 'Multi-shell multi-command argument completer',
  homepage: 'https://carapace.sh',
  github: 'https://github.com/carapace-sh/carapace-bin',
  programs: ['carapace'],
  versionSource: {
    type: 'github-releases',
    repo: 'carapace-sh/carapace-bin',
  },
  distributable: {
    url: 'https://github.com/carapace-sh/carapace-bin/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.21',
  },

  build: {
    script: [
      'go mod download',
      'go generate ./cmd/...',
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/carapace',
    ],
    env: {
      'ARGS': ['-trimpath', '-tags release', '-o={{prefix}}/bin/carapace'],
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
