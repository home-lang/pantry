import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/ice',
  name: 'ice',
  programs: [],
  dependencies: {
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
    'x.org/xtrans': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libICE-{{version}}.tar.gz',
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
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--enable-docs=no',
        '--enable-specs=no',
      ],
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
