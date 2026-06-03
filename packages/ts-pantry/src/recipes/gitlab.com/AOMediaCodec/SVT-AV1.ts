import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gitlab.com/AOMediaCodec/SVT-AV1',
  name: 'SVT-AV1',
  programs: [
    'SvtAv1EncApp',
  ],
  buildDependencies: {
    'cmake.org': '*',
    'yasm.tortall.net': '*',
  },
  distributable: {
    url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/archive/v{{version}}/SVT-AV1-v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/project(svt-av1 VERSION .*/project(svt-av1 VERSION {{version}}/\' CMakeLists.txt',
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DBUILD_SHARED_LIBS=OFF',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
      linux: {
        ARGS: [
          '-DCMAKE_C_COMPILER=cc',
          '-DCMAKE_CXX_COMPILER=c++',
        ],
      },
    },
  },
}
