import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/westes/flex',
  name: 'flex',
  programs: [
    'flex',
    'flex++',
  ],
  dependencies: {
    'gnu.org/gettext': '^0',
    'gnu.org/m4': '^1',
  },
  distributable: {
    url: 'https://github.com/westes/flex/releases/download/v2.6.4/flex-2.6.4.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{ prefix }}',
        '--with-pic',
        '--disable-bootstrap',
        '--enable-shared',
      ],
      darwin: {
        MACOSX_DEPLOYMENT_TARGET: 10.6,
      },
      linux: {
        CPPFLAGS: '-D_GNU_SOURCE',
      },
    },
  },
  test: {
    script: [
      'flex test.flex',
      'cc lex.yy.c -lfl',
      'OUT=$(echo "Hello World" | ./a.out)',
      'test "$OUT" = "Hello',
      'World"',
    ],
  },
}
