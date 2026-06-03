import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/mpfr',
  name: 'mpfr',
  programs: [],
  buildDependencies: {
    'gnu.org/gmp': '>=4.2',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/mpfr/mpfr-{{ version.raw }}.tar.gz',
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
      'gcc -lgmp -lmpfr test.c -o test',
      'test $(./test) = \'{{version}}\'',
    ],
  },
}
