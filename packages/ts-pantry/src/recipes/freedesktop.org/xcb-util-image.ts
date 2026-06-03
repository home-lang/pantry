import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/xcb-util-image',
  name: 'xcb-util-image',
  programs: [],
  dependencies: {
    'x.org/xcb': '*',
    'freedesktop.org/xcb-util': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://xcb.freedesktop.org/dist/xcb-util-image-{{version}}.tar.gz',
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
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -o test',
      './test',
      'pkg-config --modversion xcb-image | grep {{version}}',
    ],
  },
}
