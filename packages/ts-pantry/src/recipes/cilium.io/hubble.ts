import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cilium.io/hubble',
  name: 'hubble',
  programs: [
    'hubble',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
  },
  distributable: {
    url: 'https://github.com/cilium/hubble/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install BINDIR={{ prefix }}/bin VERSION={{ version }} GIT_BRANCH= GIT_HASH=',
    ],
  },
  test: {
    script: [
      'hubble version | grep {{ version }}',
    ],
  },
}
