import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "unidata.ucar.edu/netcdf",
  name: "netcdf",
  programs: [
    "nc-config",
    "nccopy",
    "ncdump",
    "ncgen",
    "ncgen3",
  ],
  dependencies: {
    'hdfgroup.org/HDF5': "*",
    'sourceware.org/bzip2': "*",
    'curl.se': "*",
    'gnome.org/libxml2': "~2.13",
    'zlib.net': "*",
  },
  buildDependencies: {
    'gnu.org/make': "*",
    'cmake.org': "*",
    'gnu.org/m4': "*",
    linux: {
      'gnu.org/gcc': "*",
    },
  },
  distributable: {
    url: "https://github.com/Unidata/netcdf-c/archive/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "cmake -S . -B build_shared $ARGS -DBUILD_SHARED_LIBS=ON\ncmake --build build_shared\ncmake --install build_shared",
      },
      {
        run: "cmake -S . -B build_static $ARGS -DBUILD_SHARED_LIBS=OFF\ncmake --build build_static\ncmake --install build_static",
      },
      "if ! test -f {{prefix}}/lib/libnetcdf.a; then\n  install build_static/liblib/libnetcdf.a {{prefix}}/lib/\nfi\n",
      {
        run: "sed -i \"s/::LIB_SUFFIX::/$LIB_SUFFIX/g\" $PROP\nsed -E -i -f $PROP *.cmake",
        'working-directory': "${{prefix}}/lib/cmake/netCDF",
      },
      {
        run: "sed -i -e \"s|$PKGX_DIR|\\${PKGX_DIR}|g\" bin/nc-config lib/cmake/netCDF/netCDFConfig.cmake lib/libnetcdf.settings",
        'working-directory': "${{prefix}}",
      },
      {
        run: "sed -i \"s|$PKGX_DIR|\\${pcfiledir}/../../..|g\" netcdf.pc",
        'working-directory': "${{prefix}}/lib/pkgconfig",
      },
    ],
    env: {
      ARGS: [
        "-DENABLE_TESTS=OFF",
        "-DENABLE_NETCDF_4=ON",
        "-DENABLE_DOXYGEN=OFF",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_INSTALL_LIBDIR=lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_FIND_FRAMEWORK=LAST",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
        "-DBUILD_TESTING=OFF",
      ],
      darwin: {
        CC: "clang",
        CXX: "clang++",
        LD: "/usr/bin/ld",
        LIB_SUFFIX: "dylib",
      },
      linux: {
        LIB_SUFFIX: "so",
        ARGS: [
          "-DCMAKE_POSITION_INDEPENDENT_CODE=ON",
        ],
      },
    },
  },
  test: {
    script: [
      "$CC test.c -o test $LIBS",
      "./test | grep {{version}}",
      "nc-config --version | grep {{version}}",
    ],
  },
}
