import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mtoyoda/sl',
  propsDir: '../../props/github.com/mtoyoda/sl',
  name: 'sl',
  programs: [
    'sl',
  ],
  dependencies: {
    'invisible-island.net/ncurses': 6,
  },
  buildDependencies: {
    'gnu.org/patch': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/mtoyoda/sl/archive/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '# Add -v to allow testing resultant binary',
      'patch -p1 < props/version.patch',
      // ncurses 6 splits libtinfo out of libncurses, so the Makefile's bare
      // `-lncurses` leaves stdscr/tinfo unresolved. Compile directly with the
      // full link line from pkg-config (ncursesw pulls in tinfow).
      'cc -O -Wall -o sl sl.c $(pkg-config --cflags --libs ncursesw)',
      'mkdir -p {{prefix}}/bin',
      'mv sl {{prefix}}/bin',
    ],
    env: {
      TEA_VERSION: '${{ version }}',
    },
  },
}
