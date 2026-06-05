import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/jnv',
  name: 'jnv',
  programs: [
    'jnv',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'gnu.org/autoconf': '2',
    'gnu.org/automake': '1',
    'gnu.org/libtool': '2',
  },
  distributable: {
    url: 'https://github.com/ynqa/jnv/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'jnv --help',
      'test "$(jnv --version)" = "jnv {{version}}"',
    ],
  },
}
