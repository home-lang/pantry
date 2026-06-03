import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/typos',
  name: 'typos',
  programs: [
    'typos',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/crate-ci/typos/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path crates/typos-cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(typos --version)" = "typos-cli {{version}}"',
      'echo "crumble" | typos -',
      'test ! $(echo "crumlbe" | typos -)',
    ],
  },
}
