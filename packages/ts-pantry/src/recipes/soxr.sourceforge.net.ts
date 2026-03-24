import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'soxr.sourceforge.net',
  name: 'soxr.sourceforge',
  programs: [],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/soxr/soxr-{{version}}-Source.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX="{{prefix}}"'],
    },
  },
}
