import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'templ.guide',
  name: 'templ',
  description: 'A language for writing HTML user interfaces in Go.',
  homepage: 'https://templ.guide',
  github: 'https://github.com/a-h/templ',
  programs: ['templ'],
  versionSource: {
    type: 'github-releases',
    repo: 'a-h/templ',
  },
  distributable: {
    url: 'https://github.com/a-h/templ/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'echo -n {{ version }} >.version',
      'go build -v -ldflags="$LDFLAGS" -o "{{ prefix }}"/bin/templ ./cmd/templ',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-extldflags=-static', '-w', '-s'],
    },
  },
}
