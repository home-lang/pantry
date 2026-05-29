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

  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      // linux/aarch64 looks for aarch64-linux-gnu-gcc
      {
        run: 'ln -s "$(command -v clang)" aarch64-linux-gnu-gcc',
        if: 'linux/aarch64',
        'working-directory': '$HOME/.local/bin',
      },
      // <4: the crate root is an installable package
      { run: 'cargo install --locked --path . --root {{prefix}}', if: '<4' },
      // >=4: the workspace root is a virtual manifest; the binary lives in dotenv-cli
      { run: 'cargo install --locked --path dotenv-cli --root {{prefix}}', if: '>=4' },
    ],
    env: {
      'linux/aarch64': {
        PATH: '$HOME/.local/bin:$PATH',
      },
    },
  },
}
