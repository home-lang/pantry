import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/opencollab/arpack-ng',
  name: 'arpack-ng',
  programs: [],
  dependencies: {
    'eigen.tuxfamily.org': 3,
    'gnu.org/gcc': '*',
    'open-mpi.org': 5,
    'netlib.org/lapack': 3,
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/opencollab/arpack-ng/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './bootstrap',
      './configure $ARGS',
      'make',
      'make install',
      {
        run: 'cp $SRCROOT/TESTS/{testA.mtx,dnsimp.f,mmio.f,debug.h} .',
        'working-directory': '${{prefix}}/share',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-dependency-tracking',
        '--with-blas=-lblas',
        'F77=mpif77',
        '--enable-mpi',
        '--enable-icb',
        '--enable-icb-exmm',
      ],
      darwin: {
        CFLAGS: '$CFLAGS -Wl,-rpath,{{pkgx.prefix}},-headerpad_max_install_names',
        CXXFLAGS: '$CXXFLAGS -Wl,-rpath,{{pkgx.prefix}},-headerpad_max_install_names',
        FCFLAGS: '$FCFLAGS -Wl,-rpath,{{pkgx.prefix}},-headerpad_max_install_names',
        LDFLAGS: '$LDFLAGS -Wl,-headerpad_max_install_names',
      },
    },
  },
  test: {
    script: [
      'gfortran $ARGS -o test',
      'cp {{prefix}}/share/testA.mtx .',
      './test',
      './test | grep reached',
    ],
  },
}
