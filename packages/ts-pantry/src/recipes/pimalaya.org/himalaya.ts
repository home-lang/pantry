import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pimalaya.org/himalaya',
  name: 'himalaya',
  programs: [
    'himalaya',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/pimalaya/himalaya/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(himalaya --version)" = "himalaya {{version}}"',
      'himalaya --version | grep "himalaya v{{version}}"',
    ],
  },
}
