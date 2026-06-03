import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/double-conversion',
  name: 'double-conversion',
  programs: [],
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/google/double-conversion/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -DCMAKE_INSTALL_PREFIX="{{prefix}}" -DBUILD_SHARED_LIBS=ON .',
      'make --jobs {{ hw.concurrency }} ',
      'make install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE fixture.cc',
      'cc fixture.cc -ldouble-conversion -o a.out',
      './a.out',
    ],
  },
}
