import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ceres-solver.org',
  name: 'ceres-solver',
  description: 'A large-scale non-linear optimization library',
  programs: ['ceres-solver'],
  // FIXME linux/aarch64 => github.com/oneapi-src/oneTBB (linux/x86-64 only)
  platforms: ['darwin', 'linux/x86-64'],
  dependencies: {
    'eigen.tuxfamily.org': '*',
    'gflags.github.io': '*',
    'google.com/glog': '*',
    'glaros.dtc.umn.edu/metis': '*',
    'netlib.org/lapack': '*',
    'people.engr.tamu.edu/davis/suitesparse': '*',
    'github.com/oneapi-src/oneTBB': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
    'linux': {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://ceres-solver.org/ceres-solver-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cmake -S . -B _build $CMAKE_ARGS',
      'cmake --build _build',
      'cmake --install _build',
      'mkdir -p {{prefix}}/share',
      'cp -r examples data {{prefix}}/share/',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DBUILD_SHARED_LIBS=ON',
        '-DBUILD_EXAMPLES=OFF',
        '-DSUITESPARSE=ON',
        '-DCXSPARSE=OFF',
      ],
      darwin: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
}
