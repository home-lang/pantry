import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/KarypisLab/GKlib',
  name: 'GKlib',
  programs: [
    'cmpnbrs',
    'csrcnv',
    'fis',
    'gkgraph',
    'gkrw',
    'm2mnbrs',
  ],
  buildDependencies: {
    'gnu.org/make': '*',
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/KarypisLab/GKlib/archive/refs/tags/METIS-v{{version}}-DistDGL-0.5.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make config $ARGS',
      'make -j {{hw.concurrency}}',
      'make install',
    ],
    env: {
      ARGS: [
        'prefix="{{prefix}}"',
      ],
    },
  },
}
