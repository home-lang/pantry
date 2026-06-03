import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/docuum',
  name: 'docuum',
  programs: [
    'docuum',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/stepchowfun/docuum/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(docuum --version)" = "Docuum {{version}}"',
      'test "$(docuum --version)" = "docuum {{version}}"',
    ],
  },
}
