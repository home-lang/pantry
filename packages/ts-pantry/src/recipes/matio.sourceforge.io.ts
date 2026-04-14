import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'matio.sourceforge.io',
  name: 'libmatio',
  description: 'C library for reading and writing MATLAB MAT files',
  homepage: 'https://matio.sourceforge.net/',
  programs: ['matdump'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/matio/matio/{{version}}/matio-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-debug', '--disable-dependency-tracking', '--enable-extended-sparse=yes', '--enable-mat73=yes', '--with-hdf5={{deps.hdfgroup.org/HDF5.prefix}}', '--with-zlib={{deps.zlib.net.prefix}}'],
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DMATIO_WITH_HDF5=ON', '-DMATIO_WITH_ZLIB=ON', '-DMATIO_EXTENDED_SPARSE=ON', '-DMATIO_MAT73=ON'],
    },
  },
}
