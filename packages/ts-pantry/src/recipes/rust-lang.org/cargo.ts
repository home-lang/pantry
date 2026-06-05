import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rust-lang.org/cargo',
  name: 'cargo',
  programs: [
    'cargo',
  ],
  dependencies: {
    'zlib.net': '^1',
    'libgit2.org': '~1.7',
    'curl.se/ca-certs': '*',
    'curl.se': '8',
    linux: {
      'llvm.org': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '^1.85',
    'gnu.org/tar': '*',
    'tukaani.org/xz': '*',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/rust-lang/cargo/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP Cargo.toml',
        if: '<0.76.0',
      },
      'cargo install --root={{ prefix }} --locked --path=.',
    ],
    env: {
      LIBGIT2_SYS_USE_PKG_CONFIG: '1',
      LIBSSH2_SYS_USE_PKG_CONFIG: '1',
    },
  },
  test: {
    script: [
      'cargo init . --name xyz_tea_fixture',
      'echo \'fn main() {println!("Hello World!");}\' >src/main.rs',
      'cargo clippy',
      'cargo run',
      'cargo run --release',
      'export CARGO_INSTALL_ROOT=$HOME/.local',
      'cargo install cowsay',
      'test -x ~/.local/bin/cowsay',
      '~/.local/bin/cowsay xyz.tea.hi',
    ],
  },
}
