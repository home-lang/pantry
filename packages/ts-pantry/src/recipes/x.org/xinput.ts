import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xinput',
  name: 'xinput',
  programs: [
    'xinput',
  ],
  dependencies: {
    'x.org/x11': '*',
    'x.org/exts': '*',
    'x.org/xi': '*',
    'x.org/xinerama': '*',
    'x.org/xrandr': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/protocol': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/app/xinput-{{version}}.tar.xz',
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
      ],
    },
  },
  test: {
    script: [
      'test -x {{prefix}}/bin/xinput',
      'head -n 1 {{prefix}}/share/man/man1/xinput.1 | grep {{version}}',
    ],
  },
}
