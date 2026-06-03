import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'chiark.greenend.org.uk/putty',
  name: 'putty',
  programs: [
    'pageant',
    'plink',
    'pscp',
    'psftp',
    'psusan',
    'puttygen',
  ],
  buildDependencies: {
    'cmake.org': '*',
    'chiark.greenend.org.uk/halibut': '*',
    'freedesktop.org/pkg-config': '*',
    'perl.org': '*',
  },
  distributable: {
    url: 'https://the.earth.li/~sgtatham/putty/latest/putty-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX:PATH="{{prefix}}"',
        '-DRELEASE=svn-{{version.marketing}}',
        '-DPUTTY_GTK_VERSION=NONE',
      ],
    },
  },
}
