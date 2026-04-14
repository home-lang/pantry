import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opencore-amr.sourceforge.io',
  name: 'opencore-amr',
  description: 'OpenCORE Adaptive Multi Rate (AMR) speech codec',
  programs: ['opencore-amr'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/opencore-amr/opencore-amr/opencore-amr-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for opencore-amr.sourceforge.io"',    ],
  },
}
