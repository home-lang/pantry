import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/lighthouse",
  name: "lighthouse",
  programs: [
    "lighthouse",
  ],
  dependencies: {
    'zlib.net': "^1",
    linux: {
      'tukaani.org/xz': "*",
    },
  },
  buildDependencies: {
    'rust-lang.org': "^1.78",
    'rust-lang.org/cargo': "*",
    'cmake.org': "^3.12",
    'protobuf.dev': "*",
    linux: {
      'llvm.org': "^18",
    },
  },
  distributable: {
    url: "https://github.com/sigp/lighthouse/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "export LIBCLANG_PATH=$(llvm-config --libdir)\nexport BINDGEN_EXTRA_CLANG_ARGS=\"--sysroot=/ -isystem /usr/include/$(uname -m)-linux-gnu\"",
        if: "linux",
      },
      "make CARGO_INSTALL_EXTRA_FLAGS=\"--root {{prefix}}\"",
    ],
  },
  test: {
    script: [
      "lighthouse account_manager wallet list",
      "test -d ~/.lighthouse/mainnet/wallets",
    ],
  },
}
