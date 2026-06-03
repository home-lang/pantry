import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'permit.io/cedar-agent',
  name: 'cedar-agent',
  programs: [
    'cedar-agent',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/permitio/cedar-agent/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,10s/^version = .*/version = "{{ version }}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
