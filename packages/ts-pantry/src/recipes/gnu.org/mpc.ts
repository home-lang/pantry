import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/mpc',
  name: 'mpc',
  programs: [],
  buildDependencies: {
    'gnu.org/gmp': '>=4.2',
    'gnu.org/mpfr': '^4',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/mpc/mpc-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc -lgmp -lmpc -lmpfr test.c -o test',
      './test',
    ],
  },
}
