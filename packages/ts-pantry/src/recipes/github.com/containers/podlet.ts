import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/containers/podlet',
  name: 'podlet',
  programs: [
    'podlet',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.7.0',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/containers/podlet/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
