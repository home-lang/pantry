import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/open-source-parsers/jsoncpp',
  name: 'jsoncpp',
  programs: [],
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://github.com/open-source-parsers/jsoncpp/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'clang++ -std=c++11 ./test.cpp -o test -ljsoncpp',
      './test',
    ],
  },
}
