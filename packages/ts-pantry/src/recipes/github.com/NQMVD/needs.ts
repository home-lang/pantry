import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/NQMVD/needs',
  name: 'needs',
  programs: [
    'needs',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.87',
  },
  distributable: {
    url: 'https://github.com/NQMVD/needs/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'needs --version',
      'needs --help',
      'needs cargo rust rustc',
      'needs --no-versions git make',
    ],
  },
}
