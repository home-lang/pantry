import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thom311/libnl',
  name: 'libnl',
  programs: [],
  buildDependencies: {
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
  },
  distributable: {
    url: 'https://github.com/thom311/libnl/releases/download/libnl{{version.major}}_{{version.minor}}_{{version.patch}}/libnl-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'gcc ./fixture.c -lnl-3 -lnl-route-3 -o test',
      '(./test 2>&1 || true) | grep "$OUT"',
      'nl-route-list | grep "$OUT2"',
    ],
  },
}
