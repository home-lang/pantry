import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fuellabs.github.io/sway',
  name: 'sway',
  programs: [
    'forc',
  ],
  dependencies: {
    'zlib.net': '^1',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.78',
    'rust-lang.org/cargo': '^0',
    'perl.org': '*',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/FuelLabs/sway/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path forc --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'forc new pkgx_test',
      'cd pkgx_test',
      'cat $FIXTURE >src/main.sw',
      'forc test',
    ],
  },
}
