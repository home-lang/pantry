import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cuelang.org',
  name: 'cue',
  description: 'The home of the CUE language! Validate and define text-based and dynamic configuration',
  homepage: 'https://cuelang.org/',
  github: 'https://github.com/cue-lang/cue',
  programs: ['cue'],
  versionSource: {
    type: 'github-releases',
    repo: 'cue-lang/cue/tags',
  },
  distributable: {
    url: 'https://github.com/cue-lang/cue/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '>=1.18<1.25',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" -o "{{ prefix }}"/bin/cue ./cmd/cue',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X cuelang.org/go/cmd/cue/cmd.version=v{{ version }}'],
    },
  },
}
