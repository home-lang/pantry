import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/wasm-pack',
  name: 'wasm-pack',
  programs: [
    'wasm-pack',
  ],
  dependencies: {
    'rust-lang.org': '*',
    'rust-lang.org/cargo': '*',
  },
  buildDependencies: {
    'cmake.org': '3',
  },
  distributable: {
    url: 'https://github.com/rustwasm/wasm-pack/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
    env: {
      RUSTFLAGS: [
        '-A warnings',
        '-C debuginfo=0',
      ],
    },
  },
  test: {
    script: [
      'test "$(wasm-pack --version)" = "wasm-pack {{version.raw}}"',
    ],
  },
}
