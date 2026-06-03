import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/npryce/adr-tools',
  name: 'adr-tools',
  programs: [
    'adr',
  ],
  dependencies: {
    'gnu.org/bash': '*',
  },
  distributable: {
    url: 'https://github.com/npryce/adr-tools/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{ prefix }}/bin',
      'cp src/* {{prefix}}/bin',
    ],
  },
  test: {
    script: [
      'adr help init | cat',
    ],
  },
}
