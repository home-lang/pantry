import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/jwt-cli',
  name: 'jwt-cli',
  programs: [
    'jwt',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/mike-engel/jwt-cli/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(jwt --version)" = "jwt {{version}}"',
    ],
  },
}
