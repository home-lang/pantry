import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'orhun.dev/gpg-tui',
  name: 'gpg-tui',
  programs: [
    'gpg-tui',
  ],
  dependencies: {
    'gnupg.org': '*',
    'gnupg.org/gpgme': '^1.12',
    'gnupg.org/libgpg-error': '*',
    'x.org/xcb': '*',
  },
  buildDependencies: {
    'rust-lang.org': '^1.70',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '^0',
  },
  distributable: {
    url: 'https://github.com/orhun/gpg-tui/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --root {{prefix}} --path .',
    ],
  },
  test: {
    script: [
      'gpg-tui --version | grep {{version}}',
    ],
  },
}
