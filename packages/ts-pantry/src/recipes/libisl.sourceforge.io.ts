import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libisl.sourceforge.io',
  name: 'libisl.sourceforge',
  programs: [],
  distributable: {
    url: 'https://libisl.sourceforge.io/isl-{{version.raw}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/gmp': '^6',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--with-gmp=system",'],
    },
  },
}
