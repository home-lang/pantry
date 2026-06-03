import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/versio',
  name: 'versio',
  programs: [
    'versio',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'gnupg.org/libgpg-error': 1,
    'gnupg.org/gpgme': '^1.13',
    'gnupg.org/libassuan': '*',
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.78',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/chaaz/versio/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
