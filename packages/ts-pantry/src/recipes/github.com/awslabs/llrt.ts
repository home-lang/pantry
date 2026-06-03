import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/awslabs/llrt",
  name: "llrt",
  programs: [
    "llrt",
  ],
  buildDependencies: {
    'rust-lang.org/rustup': "*",
    'facebook.com/zstd': "*",
    'nodejs.org': "*",
    'yarnpkg.com': "*",
    'cmake.org': "*",
    'git-scm.org': "*",
  },
  distributable: {
    url: "git+https://github.com/awslabs/llrt",
  },
  build: {
    script: [
      {
        run: "ln -sf {{deps.rust-lang.org/rustup.prefix}}/bin/rustup rustup\nrustup default nightly\nrustup component add rust-src\nln -sf $HOME/.rustup/toolchains/*/bin/* .",
        'working-directory': "$HOME/.cargo/bin",
      },
      "git submodule update --init --checkout",
      "yarn",
      "node build.mjs",
      {
        run: "find . -name Cargo.toml -print0 | xargs -0 sed -i 's/ = \"0.8.0-beta\"/ = \{{version}}-beta\/g'",
        if: "=0.8.1",
      },
      "cargo install --path llrt --root {{prefix}}",
    ],
    env: {
      PATH: "$HOME/.cargo/bin:$PATH",
    },
  },
  test: {
    script: [
      "llrt --version",
      "llrt --version | grep {{version}}",
      "test \"$(llrt $FIXTURE)\" = \"Hello, world!\"",
    ],
  },
}
