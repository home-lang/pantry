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

  build: {
    script: [
      'cargo install $CARGO_ARGS',
      'mv $FIXTURE hi.js',
      'sg run -l js -p console.log hi.js | grep \\it is me\\',
      'ast-grep --version | grep {{version}}',
    ],
  },
}
