import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'saerasoft.com/caesium',
  name: 'caesium',
  programs: [
    'caesiumclt',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Lymphatus/caesium-clt/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
