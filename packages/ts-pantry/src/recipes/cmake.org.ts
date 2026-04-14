import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cmake.org',
  name: 'cmake',
  description: 'Mirror of CMake upstream repository',
  homepage: 'https://www.cmake.org/',
  github: 'https://github.com/Kitware/CMake',
  programs: ['cmake', 'ccmake', 'cpack', 'ctest'],
  versionSource: {
    type: 'github-releases',
    repo: 'Kitware/CMake',
  },
  distributable: {
    url: 'https://github.com/Kitware/CMake/releases/download/v{{version}}/cmake-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '1',
    'sourceware.org/bzip2': '1',
  },

  build: {
    script: [
      './bootstrap $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'rm -rf {{prefix}}/share/doc  # docs are online',
    ],
    env: {
      'V': '1',
      'ARGS': ['--prefix={{prefix}}', '--parallel=1', '--datadir=/var', '--docdir=/share/doc', '--mandir=/share/man', '--system-zlib', '--', '-DCMake_BUILD_LTO=ON', '-DCMAKE_VERBOSE_MAKEFILE:BOOL=ON'],
    },
  },
}
