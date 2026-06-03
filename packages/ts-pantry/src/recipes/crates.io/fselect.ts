import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/fselect',
  name: 'fselect',
  programs: [
    'fselect',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/jhspetersson/fselect/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
