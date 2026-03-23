import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cgal.org',
  name: 'cgal',
  description: 'The public CGAL repository, see the README below',
  homepage: 'https://github.com/CGAL/cgal#readme',
  github: 'https://github.com/CGAL/cgal',
  programs: ['cgal_create_CMakeLists', 'cgal_create_cmake_script', 'cgal_make_macosx_app'],
  versionSource: {
    type: 'github-releases',
    repo: 'CGAL/cgal',
  },
  distributable: {
    url: 'https://github.com/CGAL/cgal/releases/download/v{{version.marketing}}/CGAL-{{version.marketing}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'boost.org': '*',
    'eigen.tuxfamily.org': '*',
    'gnu.org/gmp': '*',
    'gnu.org/mpfr': '*',
    'openssl.org': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake . $CMAKE_ARGS',
      'make install',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DCMAKE_CXX_FLAGS=\'-std=c++14\''],
    },
  },
}
