import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kaspanet/rusty-kaspa',
  name: 'rusty-kaspa',
  programs: [
    'kaspad',
    'kaspa-cli',
  ],
  dependencies: {
    linux: {
      'openssl.org': '^1.1',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'protobuf.dev': '*',
    'abseil.io': '^20250127',
    'curl.se': '*',
  },
  distributable: {
    url: 'https://github.com/kaspanet/rusty-kaspa/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path kaspad --locked --root {{prefix}} --features=heap',
      'cargo install --path cli --locked --root {{prefix}}',
    ],
  },
  test: {
    script: [
      '(kaspad --version || true) | grep "{{version}}"',
    ],
  },
}
