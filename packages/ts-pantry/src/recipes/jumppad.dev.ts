import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jumppad.dev',
  name: 'jumppad',
  description: 'Modern cloud native development environments',
  homepage: 'https://jumppad.dev',
  github: 'https://github.com/jumppad-labs/jumppad',
  programs: ['jumppad'],
  versionSource: {
    type: 'github-releases',
    repo: 'jumppad-labs/jumppad',
  },
  distributable: {
    url: 'https://github.com/jumppad-labs/jumppad/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.21.5',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      'BUILDLOC': '{{prefix}}/bin/jumppad',
      'GO_LDFLAGS': ['-s', '-w', '-X main.version=v{{version}}'],
    },
  },
}
