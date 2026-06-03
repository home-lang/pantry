import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bytereef.org/mpdecimal',
  name: 'mpdecimal',
  programs: [],
  distributable: {
    url: 'https://www.bytereef.org/software/mpdecimal/releases/mpdecimal-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{hw.concurrency}}',
      'make install',
      'rm -rf {{prefix}}/share  # docs are online',
    ],
    env: {
      darwin: {
        LDFLAGS: '-headerpad_max_install_names $LDFLAGS',
        LDXXFLAGS: '-headerpad_max_install_names $LDXXFLAGS',
      },
    },
  },
  test: {
    script: [
      'cc test.c -o test -lmpdec',
      './test',
    ],
  },
}
