import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'asciinema.org/agg',
  name: 'agg',
  programs: [
    'agg',
  ],
  dependencies: {
    'rust-lang.org': '^1.56',
  },
  buildDependencies: {
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/asciinema/agg/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(agg --version)" = "agg {{version}}"',
    ],
  },
}
