import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'koyeb.com',
  name: 'koyeb',
  description: 'Koyeb cli',
  github: 'https://github.com/koyeb/koyeb-cli',
  programs: ['koyeb'],
  versionSource: {
    type: 'github-releases',
    repo: 'koyeb/koyeb-cli',
  },
  distributable: {
    url: 'https://github.com/koyeb/koyeb-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BINLOC ./cmd/koyeb',
      '',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BINLOC': '{{prefix}}/bin/koyeb',
      'LDFLAGS': ['-s', '-w', '-X main.debugMode=false', '-X github.com/koyeb/koyeb-cli/pkg/koyeb.Version={{version}}'],
    },
  },
}
