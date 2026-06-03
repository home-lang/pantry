import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/rtx-cli",
  name: "rtx-cli",
  programs: [],
  dependencies: {
    'openssl.org': "^1.1",
    'libgit2.org': "^1",
  },
  buildDependencies: {
    'rust-lang.org': "^1.78",
    'rust-lang.org/cargo': "*",
    'cmake.org': 3,
  },
  distributable: {
    url: "https://github.com/jdx/mise/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cargo install --locked --path . --root {{prefix}}",
      {
        run: "if test -f rtx; then\n  ln -s rtx mise\nelif test -f mise; then\n  ln -s mise rtx\nfi\n",
        'working-directory': {{prefix}}/bin,
      },
    ],
    env: {
      'linux/x86-64': {
        RUSTFLAGS: "-C target-feature=+cmpxchg16b",
      },
    },
  },
}
