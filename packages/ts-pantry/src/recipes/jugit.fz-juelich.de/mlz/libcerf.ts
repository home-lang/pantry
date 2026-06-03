import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jugit.fz-juelich.de/mlz/libcerf',
  name: 'libcerf',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
    'perl.org': '^5',
  },
  distributable: {
    url: 'https://jugit.fz-juelich.de/mlz/libcerf/-/archive/v{{version.marketing}}/libcerf-v{{version.marketing}}.tar.gz',
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
        '-DCMAKE_INSTALL_LIBDIR={{prefix}}/lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lcerf -o test',
      './test',
      'pkg-config --modversion libcerf | grep {{version.marketing}}',
    ],
  },
}
