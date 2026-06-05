import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/joshuto',
  name: 'joshuto',
  programs: [
    'joshuto',
  ],
  dependencies: {
    'libgit2.org': '1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/kamiyaa/joshuto/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'joshuto version | grep joshuto-{{version}}',
      'joshuto completions zsh',
      'joshuto config joshuto',
    ],
  },
}
