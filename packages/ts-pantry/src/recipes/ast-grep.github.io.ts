import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ast-grep.github.io',
  name: 'ast-grep.github',
  description: '⚡A CLI tool for code structural search, lint and rewriting. Written in Rust',
  homepage: 'https://ast-grep.github.io/',
  github: 'https://github.com/ast-grep/ast-grep',
  programs: ['sg', 'ast-grep'],
  versionSource: {
    type: 'github-releases',
    repo: 'ast-grep/ast-grep',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/ast-grep/ast-grep/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'rust-lang.org': '*',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install $CARGO_ARGS',
    ],
    env: {
      'linux/aarch64': {
        RUSTFLAGS: '-C linker=cc',
      },
      CARGO_ARGS: [
        '--locked',
        '--root={{prefix}}',
        '--path=crates/cli',
      ],
    },
  },
}
