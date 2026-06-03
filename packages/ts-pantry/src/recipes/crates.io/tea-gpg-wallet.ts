import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/tea-gpg-wallet',
  name: 'tea-gpg-wallet',
  programs: [
    'tea-gpg-wallet',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.89',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/jhheider/tea-gpg-wallet/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'tea-gpg-wallet --help',
      'test "$(tea-gpg-wallet --version)" = \'tea-gpg-wallet {{version}}\'',
      'tea-gpg-wallet find 95469C7E3DFC90B1 | tee out',
      'grep 95469C7E3DFC90B1 out',
      'grep \'0xD7bAAE85D719C2e8e27A70194471ef4b6B253D33\' out',
      'grep deployed out',
    ],
  },
}
