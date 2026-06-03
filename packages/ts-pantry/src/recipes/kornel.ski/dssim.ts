import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "kornel.ski/dssim",
  name: "dssim",
  programs: [
    "dssim",
  ],
  buildDependencies: {
    'rust-lang.org/rustup': "*",
    'linux/x86-64': {
      'llvm.org': "*",
    },
  },
  distributable: {
    url: "https://github.com/kornelski/dssim/archive/refs/tags/{{ version.tag }}.tar.gz",
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
      RUSTFLAGS: [
        "-Zunstable-options",
      ],
      'linux/x86-64': {
        CC: "clang",
        CXX: "clang++",
        AR: "llvm-ar",
      },
    },
  },
  test: {
    script: [
      "pango-view --height=50 --width=50 -qo hi.png $FIXTURE",
      "pango-view --height=50 --width=50 -qo bye.png $FIXTURE",
      "dssim hi.png bye.png | grep -E '[09\\.]* *bye.png'",
    ],
  },
}
