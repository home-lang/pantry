import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ceres-solver.org',
  name: 'ceres-solver',
  description: '',
  programs: ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  distributable: {
    url: 'http://ceres-solver.org/ceres-solver-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cmake -S . -B _build $CMAKE_ARGS',
      'cmake --build _build',
      'cmake --install _build',
      'mkdir -p {{prefix}}/share',
      'cp -r examples data {{prefix}}/share/',
      'cp {{prefix}}/share/examples/helloworld.cc ./',
      'run: |',
      'cmake .',
      'make',
      './helloworld',
    ],
  },
}
