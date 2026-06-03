import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "people.engr.tamu.edu/davis/suitesparse",
  name: "suitesparse",
  programs: [
    "mongoose",
    "suitesparse_mongoose",
  ],
  dependencies: {
    'glaros.dtc.umn.edu/metis': "*",
    'gnu.org/m4': "*",
    'netlib.org/lapack': "*",
    'gnu.org/gmp': "*",
    'openmp.llvm.org': "*",
    'gnu.org/mpfr': "*",
    'gnu.org/gcc': "*",
  },
  buildDependencies: {
    'cmake.org': "*",
    linux: {
      'gnu.org/make': "*",
    },
  },
  distributable: {
    url: "https://github.com/DrTimothyAldenDavis/SuiteSparse/archive/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i -e 's/^set ( SUITESPARSE_VERSION_MAJOR.*/set ( SUITESPARSE_VERSION_MAJOR {{version.major}} )/' -e 's/^set ( SUITESPARSE_VERSION_MINOR.*/set ( SUITESPARSE_VERSION_MINOR {{version.minor}} )/' -e 's/^set ( SUITESPARSE_VERSION_SUB.*/set ( SUITESPARSE_VERSION_SUB {{version.patch}} )/' CMakeLists.txt",
        'working-directory': "SuiteSparse_config",
      },
      "make library $ARGS CMAKE_OPTIONS=\"$CMAKE_ARGS\"",
      "make install $ARGS CMAKE_OPTIONS=\"$CMAKE_ARGS\"",
      {
        run: "ln -s mongoose suitesparse_mongoose",
        if: "<7.4.0",
        'working-directory': "{{prefix}}/bin",
      },
      {
        run: "ln -s suitesparse_mongoose mongoose",
        if: ">=7.4.0",
        'working-directory': "{{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "INSTALL={{prefix}}",
        "JOBS={{hw.concurrency}}",
      ],
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX=\"{{prefix}}",
        "-DCMAKE_INSTALL_LIBDIR=lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_FIND_FRAMEWORK=LAST",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
        "-DBUILD_TESTING=OFF",
        "-DBLA_VENDOR=LAPACK",
      ],
      linux: {
        CMAKE_ARGS: [
          "-DLAPACK_LIBRARIES={{deps.netlib.org/lapack.prefix}}/lib/liblapack.so.{{deps.netlib.org/lapack.version.major}}",
          "-DBLAS_LIBRARIES={{deps.netlib.org/lapack.prefix}}/lib/libblas.so.{{deps.netlib.org/lapack.version.major}}",
        ],
      },
      darwin: {
        CC: "clang",
        CXX: "clang++",
        LD: "clang",
        CMAKE_ARGS: [
          "-DLAPACK_LIBRARIES={{deps.netlib.org/lapack.prefix}}/lib/liblapack.{{deps.netlib.org/lapack.version.major}}.dylib",
          "-DBLAS_LIBRARIES={{deps.netlib.org/lapack.prefix}}/lib/libblas.{{deps.netlib.org/lapack.version.major}}.dylib",
        ],
      },
    },
  },
  test: {
    script: [
      "pkg-config --modversion SuiteSparse_config | grep {{version}}",
      "if ! test -f /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/AvailabilityInternalLegacy.h; then\n  echo \"Missing SDK; skipping remaining tests\"\n  exit 0\nfi\n",
      "clang test.c -lsuitesparseconfig -lklu -o test -Wl,-rpath,{{pkgx.prefix}}",
      "./test",
    ],
  },
}
