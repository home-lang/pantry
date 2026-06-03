import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/tabiew",
  name: "tabiew",
  programs: [
    "tw",
  ],
  dependencies: {
    linux: {
      'openssl.org': "*",
    },
  },
  buildDependencies: {
    'rust-lang.org/rustup': "*",
  },
  distributable: {
    url: "https://github.com/shshemi/tabiew/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "sed -i 's/^version = .*/version = \{{ version }}\/' Cargo.toml",
      {
        run: "CHAIN=nightly\nPOLARS=\"--features 'polars/nightly'\"",
        if: "<0.12",
      },
      {
        run: "CHAIN=stable",
        if: ">=0.12",
      },
      {
        run: "ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup .\nrustup default $CHAIN\nln -sf $HOME/.rustup/toolchains/*/bin/* .",
        'working-directory': "$HOME/.cargo/bin",
      },
      "cargo install --locked --path . --root {{prefix}} $POLARS",
    ],
    env: {
      PATH: "$HOME/.cargo/bin:$PATH",
    },
  },
}
