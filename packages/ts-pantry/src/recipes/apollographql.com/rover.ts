import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apollographql.com/rover',
  name: 'rover',
  programs: [
    'rover',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    linux: {
      'perl.org': '^5',
    },
  },
  distributable: {
    url: 'https://github.com/apollographql/rover/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,20s/^version = ".*"/version = "{{ version }}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
