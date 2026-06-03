import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/bpb',
  name: 'bpb',
  programs: [
    'bpb',
  ],
  buildDependencies: {
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/withoutboats/bpb/tarball/b1ef5ca1d2dea0e2ec0b1616f087f110ea17adfa',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
