import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'aux4.io',
  name: 'aux4',
  description: 'elevate your imagination',
  homepage: 'https://aux4.io',
  github: 'https://github.com/aux4/aux4',
  programs: ['aux4'],
  versionSource: {
    type: 'github-releases',
    repo: 'aux4/aux4',
  },
  distributable: {
    url: 'https://github.com/aux4/aux4/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.21.5',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS" .',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
      'ARGS': ['-v', '-trimpath', '-o "{{prefix}}/bin/aux4"'],
    },
  },
}
