import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'xcfile.dev',
  name: 'xc',
  description: 'Markdown defined task runner.',
  homepage: 'https://xcfile.dev/',
  github: 'https://github.com/joerdav/xc',
  programs: ['xc'],
  versionSource: {
    type: 'github-releases',
    repo: 'joerdav/xc/tags',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/joerdav/xc/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'cd ./cmd/xc',
      'GOBIN={{prefix}}/bin go install -ldflags="$LDFLAGS" .',
      '',
    ],
    env: {
      'LDFLAGS': ['-X=main.version={{version}}'],
    },
  },
}
