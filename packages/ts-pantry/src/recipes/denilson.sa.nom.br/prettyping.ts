import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'denilson.sa.nom.br/prettyping',
  name: 'prettyping',
  programs: [
    'prettyping',
  ],
  distributable: {
    url: 'https://github.com/denilsonsa/prettyping/archive/refs/tags/v{{ version }}/prettyping-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{ prefix }}/bin',
      'mv prettyping {{ prefix }}/bin',
    ],
  },
}
