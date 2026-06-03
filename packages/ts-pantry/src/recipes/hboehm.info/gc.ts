import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hboehm.info/gc',
  name: 'gc',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'github.com/ivmai/libatomic_ops': '*',
  },
  distributable: {
    url: 'https://github.com/ivmai/bdwgc/releases/download/v{{version}}/gc-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} check',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--enable-cplusplus',
        '--enable-static',
        '--enable-large-config',
      ],
      linux: {
        CXXFLAGS: '$CXXFLAGS -std=c++14',
      },
      darwin: {
        CFLAGS: '$CFLAGS -Wno-incompatible-function-pointer-types',
      },
    },
  },
  test: {
    script: [
      'pkg-config --modversion bdw-gc | grep {{version.marketing}}',
      'cc test.cc -lgc -o test',
      './test',
    ],
  },
}
