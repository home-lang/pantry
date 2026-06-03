import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hugo.wang/cicada',
  name: 'cicada',
  programs: [
    'cicada',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/mitnk/cicada/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(cicada -c \'ls -l `which cicada`\')" = "$(ls -l `which cicada`)"',
    ],
  },
}
