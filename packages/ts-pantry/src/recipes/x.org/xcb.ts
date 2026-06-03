import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xcb',
  name: 'xcb',
  programs: [],
  dependencies: {
    'x.org/xau': '^1',
    'x.org/xdmcp': '^1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'python.org': '~3.11',
    'x.org/protocol/xcb': '^1',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://xcb.freedesktop.org/dist/libxcb-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'patch -p1 <props/configure.patch',
        if: '<1.16',
      },
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
        '--enable-dri3',
        '--enable-ge',
        '--enable-xevie',
        '--enable-xprint',
        '--enable-selinux',
        '--disable-silent-rules',
        '--enable-devel-docs=no',
        '--with-doxygen=no',
      ],
    },
  },
  test: {
    script: [
      'cc fixture.c -lxcb',
      './a.out',
    ],
  },
}
