import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/exts',
  name: 'exts',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXext-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure \\',
      '  --prefix={{prefix}} \\',
      '  --sysconfdir="$SHELF"/etc \\',
      '  --localstatedir="$SHELF"/var \\',
      '  --enable-spec=no',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
    },
  },
  test: {
    script: [
      'mv $FIXTURE x.c',
      'cc x.c',
      './a.out',
    ],
  },
}
