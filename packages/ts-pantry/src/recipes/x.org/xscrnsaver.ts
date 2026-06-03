import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xscrnsaver',
  name: 'xscrnsaver',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/protocol': '*',
    'x.org/exts': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXScrnSaver-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
      ARGS: [
        '--prefix="{{prefix}}"',
        '--sysconfdir="$SHELF"/etc',
        '--localstatedir="$SHELF"/var',
        '--enable-spec=no',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE',
      './a.out',
    ],
  },
}
