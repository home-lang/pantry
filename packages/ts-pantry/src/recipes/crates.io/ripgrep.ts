import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/ripgrep',
  name: 'ripgrep',
  programs: [
    'rg',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.34',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/BurntSushi/ripgrep/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'rg hello $FIXTURE',
    ],
  },
}
