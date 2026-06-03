import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/xcb-util-wm',
  name: 'xcb-util-wm',
  programs: [],
  dependencies: {
    'x.org/xcb': '*',
    'gnu.org/m4': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://xcb.freedesktop.org/dist/xcb-util-wm-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -o test',
      './test',
      'pkg-config --modversion xcb-ewmh | grep {{version}}',
      'pkg-config --modversion xcb-icccm | grep {{version}}',
    ],
  },
}
