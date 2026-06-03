import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xiph.org/libshout',
  name: 'libshout',
  programs: [
    'shout',
  ],
  dependencies: {
    'xiph.org/ogg': '*',
    'xiph.org/vorbis': '*',
    'openssl.org': '~1',
    'speex.org': '*',
    'theora.org': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    darwin: {
      'curl.se': '*',
      'gnu.org/patch': '*',
    },
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://downloads.xiph.org/releases/libshout/libshout-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'curl -L "$PATCH" | patch',
        if: 'darwin',
      },
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      PATCH: 'https://raw.githubusercontent.com/Homebrew/formula-patches/03cf8088210822aa2c1ab544ed58ea04c897d9c4/libtool/configure-big_sur.diff',
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
      'pkg-config --modversion shout | grep {{version}}',
      'cc test.c -lshout -lssl -lcrypto -o test',
      './test',
    ],
  },
}
