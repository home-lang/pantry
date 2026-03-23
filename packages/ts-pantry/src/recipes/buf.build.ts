import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'buf.build',
  name: 'buf',
  description: 'The best way of working with Protocol Buffers.',
  homepage: 'https://buf.build',
  github: 'https://github.com/bufbuild/buf',
  programs: ['buf'],
  versionSource: {
    type: 'github-releases',
    repo: 'bufbuild/buf',
  },
  distributable: {
    url: 'https://github.com/bufbuild/buf/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/buf',
      '',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/buf',
      'LDFLAGS': ['-s', '-w', '-X main.version={{version}}', '-X main.debugMode=false'],
    },
  },
}
