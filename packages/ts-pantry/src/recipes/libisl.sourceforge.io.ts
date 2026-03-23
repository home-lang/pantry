import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
