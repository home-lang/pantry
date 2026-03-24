import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gflags.github.io',
  name: 'gflags.github',
  description: 'The gflags package contains a C++ library that implements commandline flags processing. It includes built-in support for standard types such as string and the ability to define flags in the source file in which they are used. Online documentation available at:',
  homepage: 'https://gflags.github.io/gflags/',
  github: 'https://github.com/gflags/gflags',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'gflags/gflags/tags',
  },
  distributable: {
    url: 'https://github.com/gflags/gflags/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake $ARGS ..',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DBUILD_SHARED_LIBS=ON', '-DBUILD_STATIC_LIBS=ON', '-DCMAKE_POSITION_INDEPENDENT_CODE=ON'],
    },
  },
}
