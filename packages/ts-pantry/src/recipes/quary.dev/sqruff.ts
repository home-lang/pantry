import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "quary.dev/sqruff",
  name: "sqruff",
  programs: [
    "sqruff",
  ],
  dependencies: {
    linux: {
      'jemalloc.net': 5,
    },
  },
  buildDependencies: {
    'rust-lang.org/rustup': "*",
    linux: {
      'llvm.org': "*",
    },
  },
  distributable: {
    url: "https://github.com/quarylabs/sqruff/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup .\nrustup default $(grep channel $SRCROOT/rust-toolchain.toml | sed 's/channel = \"//;s/\"//')\nln -sf $HOME/.rustup/toolchains/*/bin/* .",
        'working-directory': "$HOME/.cargo/bin",
      },
      {
        run: "sed -i '/jemallocator/{N;N;d;}' cli/Cargo.toml lib/Cargo.toml\nsed -i -f $PROP cli/src/main.rs",
        if: "linux",
        'working-directory': "..",
      },
      {
        run: "if test -f config.toml; then sed -i '/-Ctarget-cpu=native/d' config.toml; fi",
        if: "darwin/x86-64",
        'working-directory': "../../.cargo",
      },
      "cargo install --locked --path . --root {{prefix}}",
    ],
    env: {
      PATH: "$HOME/.cargo/bin:$PATH",
    },
  },
  test: {
    script: [
      "sqruff --help",
      "test \"$(sqruff -V)\" = \"sqruff {{version}}\"",
      "sqruff lint $FIXTURE",
      "if ! sqruff lint $FIXTURE; then true; else false; fi",
    ],
  },
}
