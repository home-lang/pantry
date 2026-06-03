import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'eigen.tuxfamily.org',
  name: 'eigen.tuxfamily',
  programs: [],
  distributable: {
    url: 'https://gitlab.com/libeigen/eigen/-/archive/{{version}}/eigen-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    'working-directory': 'build',
    workingDirectory: 'build',
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}}',
      'make install',
      // the libraries are in share for some reason
      {
        run: 'ln -s share lib',
        'working-directory': '{{prefix}}',
      },
    ],
  },
}
