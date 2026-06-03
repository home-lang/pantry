import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/sxyazi/yazi',
  name: 'yazi',
  programs: [
    'yazi',
  ],
  dependencies: {
    'stedolan.github.io/jq': '*',
    'poppler.freedesktop.org': '*',
    'crates.io/fd-find': '*',
    'crates.io/ripgrep': '*',
    'github.com/junegunn/fzf': '*',
    'crates.io/zoxide': '*',
  },
  buildDependencies: {
    'rust-lang.org': '^1.70',
    'rust-lang.org/cargo': '*',
    'llvm.org': '<17',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/sxyazi/yazi/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cargo install --locked --root {{prefix}} --path app',
        if: '<0.2.0',
      },
      {
        run: 'cargo install --locked --root {{prefix}} --path yazi-fm',
        if: '>=0.2.0',
      },
    ],
    env: {
      CC: 'clang',
      LD: 'clang',
    },
  },
  test: {
    script: [
      'yazi --version | grep {{version}}',
    ],
  },
}
