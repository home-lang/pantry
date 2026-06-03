import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/sccache',
  name: 'sccache',
  programs: [
    'sccache',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.70',
    'rust-lang.org/cargo': '*',
    'openssl.org': '^1.1',
    'curl.se/ca-certs': '*',
  },
  distributable: {
    url: 'https://github.com/mozilla/sccache/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(sccache --version)" = "sccache {{version}}"',
    ],
  },
}
