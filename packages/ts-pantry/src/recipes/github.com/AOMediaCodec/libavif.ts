import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/AOMediaCodec/libavif',
  name: 'libavif',
  programs: [
    'avifenc',
    'avifdec',
  ],
  dependencies: {
    'aomedia.googlesource.com/aom': '^3',
    'libpng.org': '^1',
    'libjpeg-turbo.org': '^2',
  },
  buildDependencies: {
    'cmake.org': '^3',
    'nasm.us': '*',
  },
  distributable: {
    url: 'https://github.com/AOMediaCodec/libavif/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DAVIF_CODEC_AOM=SYSTEM',
        '-DAVIF_BUILD_APPS=ON',
        '-DAVIF_BUILD_EXAMPLES=OFF',
        '-DAVIF_BUILD_TESTS=OFF',
        '-DAVIF_LIBYUV=OFF',
      ],
    },
  },
  test: {
    script: [
      'avifenc fixture.png test.avif',
      'test -f test.avif',
      'avifdec test.avif test.jpg',
      'test -f test.jpg',
      'cc example.c -lavif',
      './a.out test.avif',
    ],
  },
}
