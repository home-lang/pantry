import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/sd',
  name: 'sd',
  programs: [
    'sd',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/chmln/sd/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/^version = ".*"/version = "{{version}}"/\' Cargo.toml',
      {
        run: 'cargo install --locked --path . --root {{prefix}}',
        if: '<1.1.0',
      },
      {
        run: 'cargo install --locked --path sd-cli --root {{prefix}}',
        if: '>=1.1.0',
      },
    ],
  },
}
