import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "hdfgroup.org/HDF5",
  name: "HDF5",
  programs: [
    "h5c++",
    "h5cc",
    "h5clear",
    "h5copy",
    "h5debug",
    "h5delete",
    "h5diff",
    "h5dump",
    "h5format_convert",
    "h5import",
    "h5jam",
    "h5ls",
    "h5mkgrp",
    "h5perf_serial",
    "h5repack",
    "h5repart",
    "h5stat",
    "h5unjam",
    "h5watch",
  ],
  dependencies: {
    'dkrz.de/libaec': '1',
    linux: {
      'zlib.net': '1',
    },
  },
  buildDependencies: {
    'cmake.org': "*",
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'gnu.org/libtool': "*",
    linux: {
      'gnu.org/gcc': "*",
    },
    darwin: {
      'llvm.org': '20',
    },
  },
  distributable: {
    url: "https://github.com/HDFGroup/hdf5/releases/download/hdf5_{{version}}/hdf5-{{version}}.tar.gz",
    stripComponents: 2,
  },
  build: {
    script: [
      {
        run: "autoreconf --force --install --verbose\n./configure $ARGS\nmake --jobs {{hw.concurrency}} install",
        if: "<2",
      },
      {
        run: "cmake -S .. -B . $CMAKE_ARGS\ncmake --build .\ncmake --install .",
        if: ">=2",
        'working-directory': "build",
      },
      {
        run: "sed \"s|HOME|$HOME|\" $PROP >prop.sed\nsed -i -f prop.sed h5cc h5c++\nif test -f h5fc; then sed -i -f prop.sed h5fc; fi\nCC=\"$(command -v cc)\"\nsed -i \"s|${CC}|cc|g\" h5cc h5c++",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--disable-dependency-tracking",
        "--disable-silent-rules",
        "--enable-build-mode=production",
        "--enable-cxx",
        "--with-szlib={{deps.dkrz.de/libaec.prefix}}",
      ],
      linux: {
        ARGS: [
          // Fortran bindings disabled: the gnu.org/gcc build dep does not ship a
          // gfortran frontend here, so configure fell back to `cc` for Fortran
          // and died with "Fortran could not compile .f90 files". The cmake
          // (>=2) path already disables Fortran (-DHDF5_BUILD_FORTRAN=OFF); keep
          // the autotools (<2) path consistent. The h5fc relocation step is
          // already guarded behind `if test -f h5fc`.
          "--with-zlib={{deps.zlib.net.prefix}}",
        ],
      },
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DHDF5_USE_GNU_DIRS:BOOL=ON",
        "-DHDF5_INSTALL_CMAKE_DIR=lib/cmake/hdf5",
        "-DHDF5_BUILD_CPP_LIB:BOOL=ON",
        "-DHDF5_ENABLE_SZIP_SUPPORT:BOOL=ON",
        "-DHDF5_ENABLE_ZLIB_SUPPORT:BOOL=ON",
        "-Dlibaec_DIR={{deps.dkrz.de/libaec.prefix}}/lib/cmake/libaec",
        "-DHDF5_BUILD_FORTRAN:BOOL=OFF",
      ],
    },
  },
  test: {
    script: [
      "h5cc test.c",
      "./a.out | grep {{version}}",
    ],
  },
}
