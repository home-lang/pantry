import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rarlab.com',
  name: 'unrar',
  programs: ['unrar'],
  distributable: {
    url: 'https://www.rarlab.com/rar/unrarsrc-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/coreutils': '^9',
  },

  build: {
    script: [
      'make CXXFLAGS=-std=c++11',
      'install -D unrar {{prefix}}/bin/unrar',
    ],
  },
}
