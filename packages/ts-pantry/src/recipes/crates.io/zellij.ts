import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/zellij',
  name: 'zellij',
  programs: [
    'zellij',
  ],
  dependencies: {
    'zlib.net': '^1',
    'curl.se': '8',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
    'openssl.org': '^1.1',
    'perl.org': '^5',
  },
  distributable: {
    url: 'https://github.com/zellij-org/zellij/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'zellij --version',
    ],
  },
}
