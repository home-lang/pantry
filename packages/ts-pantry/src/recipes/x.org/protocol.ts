import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/protocol',
  name: 'protocol',
  programs: [],
  dependencies: {
    'x.org/util-macros': '*',
  },
  distributable: {
    url: 'https://xorg.freedesktop.org/archive/individual/proto/xorgproto-{{version.raw}}.tar.gz',
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
      'pkg-config --cflags xproto',
      'pkg-config --cflags xf86driproto',
    ],
  },
}
