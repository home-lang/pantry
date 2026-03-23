import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'eigen.tuxfamily.org',
  name: 'eigen.tuxfamily',
  programs: [],
  distributable: {
    url: 'https://gitlab.com/libeigen/eigen/-/archive/{{version}}/eigen-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}}',
      'make install',
      'cd "${{prefix}}"',
      'ln -s share lib',
    ],
  },
}
