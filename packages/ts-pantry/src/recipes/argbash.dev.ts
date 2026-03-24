import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'argbash.dev',
  name: 'argbash',
  description: 'Bash argument parsing code generator',
  github: 'https://github.com/matejak/argbash',
  programs: ['argbash', 'argbash-init', 'argbash-1to2'],
  versionSource: {
    type: 'github-releases',
    repo: 'matejak/argbash',
  },
  distributable: {
    url: 'https://github.com/matejak/argbash/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/bash': '>=3',
    'gnu.org/autoconf': '*',
  },

  build: {
    script: [
      'mkdir -p \'{{prefix}}\'',
      'cp -r bin src \'{{prefix}}\'',
    ],
  },
}
