import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xau',
  name: 'xau',
  programs: [],
  dependencies: {
    'x.org/util-macros': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXau-{{version}}.tar.gz',
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
