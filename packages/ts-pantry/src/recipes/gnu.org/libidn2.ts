import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libidn2',
  name: 'libidn2',
  programs: [
    'idn2',
  ],
  dependencies: {
    'gnu.org/gettext': '*',
  },
  buildDependencies: {
    'gnu.org/texinfo': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libidn/libidn2-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make install',
    ],
  },
  test: {
    script: [
      'test "$(idn2 ""$IN1"")" = "$OUT1"',
      'test "$(idn2 ""$IN2"")" = "$OUT2"',
    ],
  },
}
