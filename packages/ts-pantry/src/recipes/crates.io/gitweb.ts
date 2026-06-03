import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/gitweb',
  name: 'gitweb',
  programs: [
    'gitweb',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/yoannfleurydev/gitweb/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(gitweb --version)" = "gitweb {{version}}"',
    ],
  },
}
