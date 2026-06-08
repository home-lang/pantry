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
    'hdfgroup.org/HDF5': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'cmake.org': '*', // since 1.5.29
    darwin: {
      'llvm.org': '20', // since 1.5.29
    },
  },

  build: {
    script: [
      {
        run: [
          './configure $ARGS',
          'make --jobs {{hw.concurrency}} install',
        ],
        if: '<1.5.29',
      },
      {
        run: [
          'cmake -S . -B build $CMAKE_ARGS',
          'cmake --build build',
          'cmake --install build',
        ],
        if: '>=1.5.29',
      },
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-dependency-tracking', '--enable-extended-sparse=yes', '--enable-mat73=yes', '--with-hdf5={{deps.hdfgroup.org/HDF5.prefix}}', '--with-zlib={{deps.zlib.net.prefix}}'],
      // -DHDF5_ROOT / -DZLIB_ROOT explicitly point CMake's find_package(HDF5)/
      // find_package(ZLIB) at the dep prefixes. buildkit already exports
      // CMAKE_PREFIX_PATH with these, but matio's cmake/thirdParties.cmake does a
      // bare find_package(HDF5) that aborts the whole configure ("MAT73 requires
      // HDF5") if HDF5 isn't located — so make discovery deterministic. Mirrors the
      // autotools path's --with-hdf5={{...prefix}}/--with-zlib={{...prefix}} hints.
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DMATIO_WITH_HDF5=ON', '-DMATIO_WITH_ZLIB=ON', '-DMATIO_EXTENDED_SPARSE=ON', '-DMATIO_MAT73=ON', '-DHDF5_ROOT={{deps.hdfgroup.org/HDF5.prefix}}', '-DZLIB_ROOT={{deps.zlib.net.prefix}}', '-DMATIO_USE_CONAN=OFF'],
      'darwin': {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
}
