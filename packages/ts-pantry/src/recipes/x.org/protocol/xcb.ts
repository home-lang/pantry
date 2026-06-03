import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/protocol/xcb',
  name: 'xcb',
  programs: [],
  buildDependencies: {
    'python.org': '~3.11',
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://xorg.freedesktop.org/archive/individual/proto/xcb-proto-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure \\',
      '  --prefix="{{prefix}}" \\',
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
      'pkg-config --variable=xcbincludedir xcb-proto',
      'python -c "',
      'import collections',
      'output = collections.defaultdict(int)',
      'from xcbgen import xtypes"',
    ],
  },
}
