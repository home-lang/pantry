import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lcdf.org/gifsicle',
  name: 'gifsicle',
  programs: [
    'gifsicle',
  ],
  buildDependencies: {
    'gnu.org/autoconf': '^2',
    'gnu.org/automake': '^1',
  },
  distributable: {
    url: 'https://github.com/kohler/gifsicle/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf -i',
      './configure --prefix={{prefix}}',
      'make install',
    ],
  },
  test: {
    script: [
      'gifsicle --help',
    ],
  },
}
