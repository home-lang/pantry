import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libxres',
  name: 'libxres',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxres/-/archive/libXres-{{version}}/libxres-libXres-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure --prefix="{{prefix}}" --sysconfdir="{{prefix}}"/etc --localstatedir="{{prefix}}"/var --enable-spec=no',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'cc $FIXTURE',
      './a.out',
    ],
  },
}
