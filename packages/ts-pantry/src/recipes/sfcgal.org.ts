import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'sfcgal.org',
  name: 'sfcgal-config',
  description: 'C++ wrapper library around CGAL',
  homepage: 'https://sfcgal.gitlab.io/SFCGAL/',
  programs: ['sfcgal-config'],
  distributable: {
    url: 'https://gitlab.com/Oslandia/SFCGAL/-/archive/v{{version}}/SFCGAL-v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'boost.org': '*',
    'cgal.org': '*',
    'gnu.org/gmp': '*',
    'gnu.org/mpfr': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'cd "{{prefix}}/bin"',
      'sed -i.bak "s|{{prefix}}|\\$(dirname \\$0)/..|g" sfcgal-config',
      'rm sfcgal-config.bak',
      '',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
    },
  },
}
