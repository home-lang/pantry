import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/mask',
  name: 'mask',
  programs: [
    'mask',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/jacobdeichert/mask/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path mask --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'mask --version',
      'test "$(mask --version)" = "mask {{version}}"',
      'mask help',
      'test "$(mask echo)" = "Hello, World!"',
      'test "$(mask echoi pkgx)" = "Hello, pkgx!"',
      'test "$(mask options)" = "Hello, World!"',
      'test "$(mask options -i pkgx)" = "Hello, pkgx!"',
      'test "$(mask options --input pkgx)" = "Hello, pkgx!"',
      'test "$(mask nested echos)" = "Hello, World!"',
      'test "$(mask node)" = "Hello, World!"',
      'test "$(mask python)" = "Hello, World!"',
      'test "$(mask ruby)" = "Hello, World!"',
    ],
  },
}
