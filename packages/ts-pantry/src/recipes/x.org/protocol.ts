import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/protocol',
  name: 'protocol',
  programs: [],
  dependencies: {
    'x.org/util-macros': '*',
  },
  distributable: {
    // xorg.freedesktop.org/archive 404s; fetch from the freedesktop gitlab mirror.
    // xorgproto release tags are 2-part (e.g. xorgproto-2025.1), so use
    // version.marketing (major.minor) rather than the 3-part package version.
    url: 'https://gitlab.freedesktop.org/xorg/proto/xorgproto/-/archive/xorgproto-{{version.marketing}}/xorgproto-xorgproto-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // The gitlab archive has no pre-generated configure; bootstrap with autogen.sh.
      'NOCONFIGURE=1 ./autogen.sh',
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
