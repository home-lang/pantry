import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/topgrade",
  name: "topgrade",
  programs: [
    "topgrade",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/topgrade-rs/topgrade/archive/refs/tags/v{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --locked --path . --root {{prefix}}",
    ],
  },
  test: {
    script: [
      "echo -n {{version}} > topgrade_keep",
      "test \"$(topgrade --version)\" = \"Topgrade {{version}}\"\ntopgrade --dry-run --disable system",
      "test \"$(topgrade --version)\" = \"topgrade {{version}}\"\ntopgrade --dry-run --disable system --allow-root",
    ],
  },
}
