import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dotenv-linter.github.io',
  name: 'dotenv-linter',
  description: '⚡️Lightning-fast linter for .env files. Written in Rust 🦀',
  homepage: 'https://dotenv-linter.github.io',
  github: 'https://github.com/dotenv-linter/dotenv-linter',
  programs: ['dotenv-linter'],
  versionSource: {
    type: 'github-releases',
    repo: 'dotenv-linter/dotenv-linter',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/dotenv-linter/dotenv-linter/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: ln -s "$(command -v clang)" aarch64-linux-gnu-gcc',
      'run: cargo install --locked --path . --root {{prefix}}',
      'run: cargo install --locked --path dotenv-cli --root {{prefix}}',
    ],
  },
}
