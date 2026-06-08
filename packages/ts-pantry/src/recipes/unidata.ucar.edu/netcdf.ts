import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'unidata.ucar.edu/netcdf',
  name: 'netcdf',
  programs: [
    'nc-config',
    'nccopy',
    'ncdump',
    'ncgen',
    'ncgen3',
  ],
  dependencies: {
    'hdfgroup.org/HDF5': '*',
    'sourceware.org/bzip2': '*',
    'curl.se': '*',
    'gnome.org/libxml2': '~2.13',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'cmake.org': '*',
    'gnu.org/m4': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/Unidata/netcdf-c/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cmake -S . -B build_shared $ARGS -DBUILD_SHARED_LIBS=ON\ncmake --build build_shared\ncmake --install build_shared',
      },
      {
        run: 'cmake -S . -B build_static $ARGS -DBUILD_SHARED_LIBS=OFF\ncmake --build build_static\ncmake --install build_static',
      },
      'if ! test -f {{prefix}}/lib/libnetcdf.a; then\n  install build_static/liblib/libnetcdf.a {{prefix}}/lib/\nfi\n',
      {
        run: 'sed -i "s/::LIB_SUFFIX::/$LIB_SUFFIX/g" $PROP\nsed -E -i -f $PROP *.cmake',
        prop: {
          contents: [
            's:{{pkgx.prefix}}:${CMAKE_CURRENT_LIST_DIR}/../../../../../..:g',
            // eslint-disable-next-line no-super-linear-backtracking -- sed script string, not a JS regex
            '/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/include|/v\\1/include|g',
            // eslint-disable-next-line no-super-linear-backtracking -- sed script string, not a JS regex
            '/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/lib|/v\\1/lib|g',
            's/\\+brewing//g',
            's|\\\\\\\\\\\\$<LINK_ONLY:hdf5::hdf5_hl>|${CMAKE_CURRENT_LIST_DIR}/../../../../../../hdfgroup.org/HDF5/v1/lib/libhdf5_hl.::LIB_SUFFIX::|g',
            '',
          ],
        },
        'working-directory': '${{prefix}}/lib/cmake/netCDF',
      },
      {
        run: 'sed -i -e "s|$PKGX_DIR|\\${PKGX_DIR}|g" bin/nc-config lib/cmake/netCDF/netCDFConfig.cmake lib/libnetcdf.settings',
        'working-directory': '${{prefix}}',
      },
      {
        run: 'sed -i "s|$PKGX_DIR|\\${pcfiledir}/../../..|g" netcdf.pc',
        'working-directory': '${{prefix}}/lib/pkgconfig',
      },
    ],
    env: {
      ARGS: [
        // netcdf 4.10.0 renamed its options to the NETCDF_ENABLE_* namespace;
        // keep the legacy ENABLE_* names too so older versions still build.
        '-DENABLE_TESTS=OFF',
        '-DENABLE_NETCDF_4=ON',
        '-DENABLE_DOXYGEN=OFF',
        '-DNETCDF_ENABLE_TESTS=OFF',
        '-DNETCDF_ENABLE_NETCDF_4=ON',
        '-DNETCDF_ENABLE_DOXYGEN=OFF',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
      darwin: {
        CC: 'clang',
        CXX: 'clang++',
        LD: '/usr/bin/ld',
        LIB_SUFFIX: 'dylib',
      },
      linux: {
        LIB_SUFFIX: 'so',
        ARGS: [
          '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',
        ],
      },
    },
  },
  test: {
    script: [
      '$CC test.c -o test $LIBS',
      './test | grep {{version}}',
      'nc-config --version | grep {{version}}',
    ],
  },
}
