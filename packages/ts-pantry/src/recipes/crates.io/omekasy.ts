import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/omekasy',
  name: 'omekasy',
  programs: [
    'omekasy',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/ikanago/omekasy/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,20s/^version = ".*"/version = "{{ version }}"/\' Cargo.toml',
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'omekasy --font bold-italic "My new gear..."',
      'test "$(omekasy --version)" = "omekasy {{version}}"',
    ],
  },
}
