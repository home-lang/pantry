import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xcb-util',
  name: 'xcb-util',
  programs: [],
  dependencies: {
    'x.org/xcb': '^1',
  },
  distributable: {
    url: 'https://xcb.freedesktop.org/dist/xcb-util-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      {
        run: 'rm *.la',
        'working-directory': '${{prefix}}/lib',
      },
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
      ARGS: [
        '--prefix={{prefix}}',
        '--sysconfdir=$SHELF/etc',
        '--localstatedir=$SHELF/var',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'test "$(pkg-config --modversion xcb-util)" = {{version}}',
    ],
  },
}
