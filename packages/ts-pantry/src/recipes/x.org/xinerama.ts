import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xinerama',
  name: 'xinerama',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/protocol': '*',
    'x.org/exts': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXinerama-{{version}}.tar.xz',
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
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--sysconfdir={{pkgx.prefix}}/x.org/etc',
        '--localstatedir={{pkgx.prefix}}/x.org/var',
      ],
    },
  },
  test: {
    script: [
      'cc test.c',
      'pkg-config --modversion xinerama | grep {{version}}',
    ],
  },
}
