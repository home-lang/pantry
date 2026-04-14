import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ceres-solver.org',
  name: 'ceres-solver',
  description: 'A large-scale non-linear optimization library',
  programs: ['ceres-solver'],
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
      'cp {{prefix}}/share/examples/helloworld.cc ./',
      'run: |',
      'cmake .',
      'make',
      './helloworld',
    ],
  },
}
