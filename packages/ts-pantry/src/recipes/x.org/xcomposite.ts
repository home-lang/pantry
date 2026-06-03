import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xcomposite',
  name: 'xcomposite',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/xfixes': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://www.x.org/archive/individual/lib/libXcomposite-{{version}}.tar.xz',
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
      'pkg-config --modversion xcomposite | grep {{version}}',
    ],
  },
}
