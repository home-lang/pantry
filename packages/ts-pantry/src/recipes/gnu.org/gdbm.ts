import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/gdbm',
  name: 'gdbm',
  programs: [
    'gdbm_dump',
    'gdbm_load',
    'gdbmtool',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/gdbm/gdbm-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--enable-libgdbm-compat',
        '--prefix={{ prefix }}',
        '--without-readline',
      ],
      darwin: {
        CFLAGS: [
          '-Wno-implicit-function-declaration',
        ],
      },
    },
  },
  test: {
    script: [
      'echo -e $INPUT1 | gdbmtool --norc --newdb test',
      'test $(echo -e $INPUT2 | gdbmtool --norc test) = "2"',
    ],
  },
}
