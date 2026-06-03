import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'printfn.github.io/fend',
  name: 'fend',
  programs: [
    'fend',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/printfn/fend/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path cli --root {{prefix}} --locked',
    ],
  },
}
