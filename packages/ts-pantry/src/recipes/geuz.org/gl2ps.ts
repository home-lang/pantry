import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'geuz.org/gl2ps',
  name: 'gl2ps',
  programs: [],
  dependencies: {
    'libpng.org': '*',
    linux: {
      'freeglut.sourceforge.io': '*',
    },
  },
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://geuz.org/gl2ps/src/gl2ps-{{version}}.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake . $CMAKE_ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'cc -lgl2ps -framework OpenGL -framework GLUT -framework Cocoa test_darwin.c -o testfile',
      'cc -lgl2ps -lglut -lGL test_linux.c -o testfile',
      'ls . | grep testfile',
    ],
  },
}
