import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/gitopolis',
  name: 'gitopolis',
  programs: [
    'gitopolis',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1',
    'git-scm.org': '^2',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '^1.70',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '^0',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://github.com/rustworkshop/gitopolis/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --root {{prefix}} --path .',
    ],
  },
  test: {
    script: [
      'cp $FIXTURE .gitopolis.toml',
      'gitopolis clone',
      'test -f cli/README.md',
      'test -f lib/README.md',
      'test -f docs/README.md',
    ],
  },
}
