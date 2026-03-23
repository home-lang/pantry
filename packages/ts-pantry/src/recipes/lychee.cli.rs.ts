import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'lychee.cli.rs',
  name: 'lychee',
  description: '⚡ Fast, async, stream-based link checker written in Rust. Finds broken URLs and mail addresses inside Markdown, HTML, reStructuredText, websites and more!',
  homepage: 'https://lychee.cli.rs/',
  github: 'https://github.com/lycheeverse/lychee',
  programs: ['lychee'],
  versionSource: {
    type: 'github-releases',
    repo: 'lycheeverse/lychee',
  },
  distributable: {
    url: 'git+https://github.com/lycheeverse/lychee.git',
  },
  dependencies: {
    'openssl.org': '>=1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      'ARGS': ['--locked', '--root={{prefix}}', '--path=lychee-bin'],
    },
  },
}
