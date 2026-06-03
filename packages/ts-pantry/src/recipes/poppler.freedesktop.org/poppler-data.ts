import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'poppler.freedesktop.org/poppler-data',
  name: 'poppler-data',
  programs: [],
  distributable: {
    url: 'https://poppler.freedesktop.org/poppler-data-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install prefix={{prefix}} datadir={{prefix}}/lib pkgdatadir={{prefix}}/share/poppler',
      'ln -s {{prefix}}/lib/pkgconfig {{prefix}}/share/',
    ],
  },
  test: {
    script: [
      'pkg-config --cflags poppler-data',
    ],
  },
}
