import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'direnv.net',
  name: 'direnv',
  description: 'Load/unload environment variables based on $PWD',
  homepage: 'https://direnv.net/',
  github: 'https://github.com/direnv/direnv',
  programs: ['direnv'],
  versionSource: {
    type: 'github-releases',
    repo: 'direnv/direnv/releases/tags',
  },
  distributable: {
    url: 'https://github.com/direnv/direnv/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'echo -n "{{version}}" >version.txt',
      'make install PREFIX="{{ prefix }}" $EXTRA_ARGS',
    ],
  },
}
