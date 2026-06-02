import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/gmp',
  name: 'gmp',
  description: 'GNU multiple precision arithmetic library',
  homepage: 'https://gmplib.org',
  programs: [],
  buildDependencies: {
    'gnu.org/m4': '1',
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://gmplib.org/download/gmp/gmp-{{version}}.tar.bz2',
    knownVersions: ['6.3.0', '6.2.1'],
  },
  distributable: {
    url: 'https://gmplib.org/download/gmp/gmp-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --enable-cxx --with-pic --build={{hw.target}} --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} check',
      'make --jobs {{hw.concurrency}} install',
    ],
  },

  test: {
    script: [
      'cat > test.c <<\'EOF\'',
      '#include <gmp.h>',
      '#include <stdlib.h>',
      'int main() {',
      '  mpz_t i, j, k;',
      '  mpz_init_set_str (i, "1a", 16);',
      '  mpz_init (j);',
      '  mpz_init (k);',
      '  mpz_sqrtrem (j, k, i);',
      '  if (mpz_get_si (j) != 5 || mpz_get_si (k) != 1) abort();',
      '  return 0;',
      '}',
      'EOF',
      'cc test.c {{prefix}}/lib/libgmp.a',
      './a.out',
    ],
  },
}
