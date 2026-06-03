import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'leethomason.github.io/tinyxml2',
  name: 'tinyxml2',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/leethomason/tinyxml2/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-Dtinyxml2_SHARED_LIBS=ON',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE -ltinyxml2 -o test',
      './test',
      'pkg-config --modversion tinyxml2 | grep {{version}}',
    ],
  },
}
