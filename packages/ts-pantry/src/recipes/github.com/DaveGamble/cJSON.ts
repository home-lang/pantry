import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/DaveGamble/cJSON',
  name: 'cJSON',
  programs: [],
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/DaveGamble/cJSON/archive/v1.7.15.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '-DENABLE_CJSON_UTILS=On',
        '-DENABLE_CJSON_TEST=Off',
        '-DBUILD_SHARED_AND_STATIC_LIBS=On',
        '-DCMAKE_INSTALL_PREFIX="{{ prefix }}"',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE $FIXTURE.c',
      'cc $FIXTURE.c -lcjson',
      './a.out',
    ],
  },
}
