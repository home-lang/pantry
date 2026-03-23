import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'elv.sh',
  name: 'elvish',
  description: 'Powerful scripting language & versatile interactive shell',
  homepage: 'https://elv.sh/',
  github: 'https://github.com/elves/elvish',
  programs: ['elvish'],
  versionSource: {
    type: 'github-releases',
    repo: 'elves/elvish',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/elves/elvish/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
    'linux/aarch64': '[object Object]',
  },

  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o "{{ prefix }}/bin/elvish" ./cmd/elvish',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X', 'src.elv.sh/pkg/buildinfo.VersionSuffix='],
    },
  },
}
