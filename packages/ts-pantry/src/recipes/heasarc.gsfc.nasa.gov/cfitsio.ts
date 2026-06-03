import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'heasarc.gsfc.nasa.gov/cfitsio',
  name: 'cfitsio',
  programs: [],
  dependencies: {
    darwin: {
      'zlib.net': '*',
    },
  },
  distributable: {
    url: 'https://heasarc.gsfc.nasa.gov/FTP/software/fitsio/c/cfitsio-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{ prefix }}',
        '--enable-reentrant',
      ],
    },
  },
  test: {
    script: [
      'cc testprog.c -o testprog -lcfitsio',
      './testprog > testprog.lis',
      'cmp testprog.lis testprog.out',
      'cmp testprog.fit testprog.std',
    ],
  },
}
