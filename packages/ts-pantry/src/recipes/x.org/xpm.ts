import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xpm',
  name: 'xpm',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'zlib.net': '^1.2',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
    'gnu.org/gettext': 0.21,
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXpm-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure \\',
      '  --prefix={{prefix}} \\',
      '  --sysconfdir="$SHELF"/etc \\',
      '  --localstatedir="$SHELF"/var \\',
      '  --disable-open-zfile',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c',
      './a.out',
    ],
  },
}
