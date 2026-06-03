import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/silicon',
  name: 'silicon',
  programs: [
    'silicon',
  ],
  dependencies: {
    'harfbuzz.org': '^5',
    linux: {
      'freedesktop.org/fontconfig': '*',
      'freetype.org': '*',
      'x.org/xcb': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/Aloxaf/silicon/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,20s/^version = .*/version = "{{ version }}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
