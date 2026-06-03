import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/ripgrep-all',
  name: 'ripgrep-all',
  programs: [
    'rga',
    'rga-fzf',
    'rga-fzf-open',
    'rga-preproc',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.75',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/phiresky/ripgrep-all/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'rga hello $FIXTURE',
    ],
  },
}
