import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/krzkaczor/ny",
  name: "ny",
  programs: [
    "ny",
  ],
  buildDependencies: {
    'rust-lang.org/rustup': "*",
  },
  distributable: {
    url: "https://github.com/krzkaczor/ny/archive/refs/tags/v{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup .\nrustup default nightly\nln -sf $HOME/.rustup/toolchains/*/bin/* .",
        'working-directory': "$HOME/.cargo/bin",
      },
      "cargo install --locked --path . --root {{prefix}}",
    ],
    env: {
      PATH: "$HOME/.cargo/bin:$PATH",
    },
  },
  test: {
    script: [
      "test \"$(ny --version)\" = \"ny {{ version }}\"",
      "npm init -y",
      "npm i is-even",
      "ny add tldr",
      "ny install",
      "ny tldr ls",
    ],
  },
}
