import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fukuchi.org/qrencode',
  name: 'qrencode',
  programs: [
    'qrencode',
  ],
  dependencies: {
    'libpng.org': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/coreutils': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/fukuchi/libqrencode/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'echo \'#define VERSION "{{version}}"\' >> config.h',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
      CFLAGS: '$(pkg-config --cflags libpng)',
      LDFLAGS: '$(pkg-config --libs libpng)',
    },
  },
  test: {
    script: [
      'qrencode 123456789 -o test.png',
      'test "$(identify test.png | rev | cut -d \' \' -f3-| rev)" = "test.png PNG 87x87 87x87+0+0 8-bit sRGB 293B"',
    ],
  },
}
