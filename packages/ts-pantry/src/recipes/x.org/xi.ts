import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xi',
  name: 'xi',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/protocol': '*',
    'x.org/xfixes': '*',
    'x.org/exts': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXi-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--sysconfdir={{pkgx.prefix}}/x.org/etc',
        '--localstatedir={{pkgx.prefix}}/x.org/var',
        '--enable-docs=no',
        '--enable-specs=no',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion xi | grep {{version}}',
    ],
  },
}
