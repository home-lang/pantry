import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/google/re2',
  name: 're2',
  programs: [],
  dependencies: {
    'abseil.io': '^20250127',
  },
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/google/re2/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i -e \'s/\\$(includedir)#/$(subst +brewing,,$(includedir))#/\' -e \'s/\\$(libdir)#/$(subst +brewing,,\\$(libdir))#/\' -e "s/sed -i \'\'/sed -i/g" Makefile',
      'make common-install prefix={{prefix}}',
      'cmake -B build-static $ARGS',
      'make --jobs={{ hw.concurrency }} -C build-static',
      'make -C build-static install',
      'cmake -B build-shared -DBUILD_SHARED_LIBS=ON $ARGS',
      'make --jobs={{ hw.concurrency }} -C build-shared',
      'make -C build-shared install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DRE2_BUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'c++ -std=c++20 $FIXTURE -lre2 -o test',
      './test',
    ],
  },
}
