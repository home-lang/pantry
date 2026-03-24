import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ccache.dev',
  name: 'ccache',
  description: 'Object-file caching compiler wrapper',
  homepage: 'https://ccache.dev/',
  github: 'https://github.com/ccache/ccache',
  programs: ['ccache'],
  versionSource: {
    type: 'github-releases',
    repo: 'ccache/ccache',
  },
  distributable: {
    url: 'https://github.com/ccache/ccache/releases/download/{{version.tag}}/ccache-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/redis/hiredis': '*',
    'facebook.com/zstd': '*',
  },
  buildDependencies: {
    'asciidoctor.org': '*',
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'cd "{{prefix}}/libexec"',
      'files="clang,clang++,cc,gcc,gcc2,gcc3,gcc-3.3,gcc-4.0,\\',
      'gcc-4.2,gcc-4.3,gcc-4.4,gcc-4.5,gcc-4.6,gcc-4.7,gcc-4.8,\\',
      'gcc-4.9,gcc-5,gcc-6,gcc-7,gcc-8,gcc-9,gcc-10,gcc-11,gcc-12,\\',
      'gcc-13,c++,c++3,c++-3.3,c++-4.0,c++-4.2,c++-4.3,c++-4.4,c++-4.5,\\',
      'c++-4.6,c++-4.7,c++-4.8,c++-4.9,c++-5,c++-6,c++-7,c++-8,c++-9,c++-10,\\',
      'c++-11,c++-12,c++-13,g++,g++2,g++3,g++-3.3,g++-4.0,g++-4.2,g++-4.3,g++-4.4,\\',
      'g++-4.5,g++-4.6,g++-4.7,g++-4.8,g++-4.9,g++-5,g++-6,g++-7,g++-8,g++-9,g++-10,\\',
      'g++-11,g++-12,g++-13,i686-w64-mingw32-gcc,i686-w64-mingw32-g++,x86_64-w64-mingw32-gcc,\\',
      'x86_64-w64-mingw32-g++"',
      '',
      'IFS=\',\' read -ra files_array <<< "$files"',
      '',
      'for file in "${files_array[@]}"; do',
      '  ln -s ../bin/ccache "$file"',
      'done',
      '',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DBUILD_TESTING=OFF'],
    },
  },
}
