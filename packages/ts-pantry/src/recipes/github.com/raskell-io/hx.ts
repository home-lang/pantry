import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/raskell-io/hx',
  name: 'hx',
  programs: [
    'hx',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '*',
    'openssl.org': '^1.1',
  },
  distributable: {
    url: 'https://github.com/raskell-io/hx/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --root={{prefix}} --locked --path=crates/hx-cli',
    ],
  },
  test: {
    script: [
      'hx --version | tee out',
      'grep {{version}} out',
      'hx doctor',
    ],
  },
}
