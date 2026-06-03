import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/json-c/json-c',
  name: 'json-c',
  programs: [],
  buildDependencies: {
    'cmake.org': 3,
  },
  distributable: {
    url: 'https://s3.amazonaws.com/json-c_releases/releases/json-c-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX="{{prefix}}" -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'cc fixture.c -ljson-c',
      './a.out',
    ],
  },
}
