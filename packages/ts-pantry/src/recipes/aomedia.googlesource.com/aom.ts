import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aomedia.googlesource.com/aom',
  name: 'aom',
  programs: [
    'aomenc',
    'aomdec',
  ],
  buildDependencies: {
    'x86-64': {
      'nasm.us': 2,
    },
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://aomedia.googlesource.com/aom/+archive/v{{version}}.tar.gz',
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
      ],
      linux: {
        CFLAGS: '-fPIC',
        CXXFLAGS: '-fPIC',
        LDFLAGS: '-pie',
      },
    },
  },
}
