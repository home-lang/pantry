import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mozilla.org/mozjpeg',
  name: 'mozjpeg',
  programs: [
    'cjpeg',
    'djpeg',
    'jpegtran',
    'rdjpgcom',
    'tjbench',
    'wrjpgcom',
  ],
  dependencies: {
    'libpng.org': '^1',
  },
  buildDependencies: {
    'cmake.org': '^3',
    'nasm.us': '^2',
    'libpng.org': '^1',
  },
  distributable: {
    url: 'https://github.com/mozilla/mozjpeg/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make install ',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{ prefix }}',
      ],
      'linux/x86-64': {
        ARGS: [
          '-DCMAKE_C_FLAGS=-fPIC',
          '-DCMAKE_CXX_FLAGS=-fPIC',
          '-DCMAKE_EXE_LINKER_FLAGS=-pie',
        ],
      },
    },
  },
  test: {
    script: [
      'jpegtran -crop 1x1 -transpose -optimize -outfile out.jpg fixture.jpeg',
    ],
  },
}
