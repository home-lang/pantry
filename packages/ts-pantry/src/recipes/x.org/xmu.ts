import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xmu',
  name: 'xmu',
  programs: [],
  dependencies: {
    'x.org/exts': '*',
    'x.org/xt': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXmu-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure \\',
      '  --prefix={{prefix}} \\',
      '  --sysconfdir="$SHELF"/etc \\',
      '  --localstatedir="$SHELF"/var',
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
