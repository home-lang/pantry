import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/stego',
  name: 'stego',
  programs: [
    'stego',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/ajmwagar/stego/archive/d9d5911f4d2d141fea74936f235a74bf03961c71.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(stego --version)" = "stego 0.1.4"',
    ],
  },
}
