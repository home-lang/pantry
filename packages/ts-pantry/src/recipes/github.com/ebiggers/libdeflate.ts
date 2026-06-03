import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ebiggers/libdeflate',
  name: 'libdeflate',
  programs: [
    'libdeflate-gzip',
    'libdeflate-gunzip',
  ],
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/ebiggers/libdeflate/archive/refs/tags/v{{version.major}}.{{version.minor}}.tar.gz',
    stripComponents: 1,
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
    },
  },
  test: {
    script: [
      'libdeflate-gzip $FIXTURE',
      'libdeflate-gunzip -d $FIXTURE.gz',
    ],
  },
}
