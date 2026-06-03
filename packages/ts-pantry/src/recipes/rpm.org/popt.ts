import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rpm.org/popt',
  name: 'popt',
  programs: [],
  distributable: {
    url: 'http://ftp.rpm.org/popt/releases/popt-1.x/popt-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --disable-debug --disable-dependency-tracking --prefix={{ prefix }}',
      'make install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'gcc test.c -lpopt -o test',
      'test "$(./test -a 123 -b 456 -c 789 -f)" = "123::456::789::1::0"',
      'test "$(./test --optiona=987 --optionb=654 --optionc=321 --flag2)" = "987::654::321::0::1"',
    ],
  },
}
