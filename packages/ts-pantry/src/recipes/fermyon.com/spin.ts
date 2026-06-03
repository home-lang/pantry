import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "fermyon.com/spin",
  name: "spin",
  programs: [
    "spin",
  ],
  buildDependencies: {
    'rust-lang.org/rustup': "*",
    linux: {
      'llvm.org': "*",
    },
  },
  distributable: {
    url: "https://github.com/fermyon/spin/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup .\nrustup default $RUSTUP_TOOLCHAIN\nrustup target add wasm32-wasi || true\nrustup target add wasm32-wasip1 wasm32-wasip2 wasm32-unknown-unknown\nln -sf $HOME/.rustup/toolchains/*/bin/* .",
        'working-directory': "$HOME/.cargo/bin",
      },
      "cargo install --locked --path . --root {{prefix}}",
    ],
    env: {
      PATH: "$HOME/.cargo/bin:$PATH",
      linux: {
        AR: "llvm-ar",
      },
      'linux/x86-64': {
        RUSTUP_TOOLCHAIN: "stable-x86_64-unknown-linux-gnu",
      },
      'linux/aarch64': {
        RUSTUP_TOOLCHAIN: "stable-aarch64-unknown-linux-gnu",
      },
      'darwin/x86-64': {
        RUSTUP_TOOLCHAIN: "stable-x86_64-apple-darwin",
      },
      'darwin/aarch64': {
        RUSTUP_TOOLCHAIN: "stable-aarch64-apple-darwin",
      },
    },
  },
  test: {
    script: [
      "spin templates install --git https://github.com/fermyon/spin",
      "spin new --accept-defaults -t http-rust hello-rust",
      "ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup .\nrustup default stable\nrustup target add wasm32-wasip1 wasm32-wasip2 wasm32-unknown-unknown\nln -sf $HOME/.rustup/toolchains/*/bin/* .",
      "spin build",
    ],
  },
}
