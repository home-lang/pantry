import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tree-sitter.github.io',
  name: 'tree-sitter',
  description: 'Parser generator tool and incremental parsing library',
  homepage: 'https://tree-sitter.github.io/',
  github: 'https://github.com/tree-sitter/tree-sitter',
  programs: ['tree-sitter'],
  versionSource: {
    type: 'github-releases',
    repo: 'tree-sitter/tree-sitter',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/tree-sitter/tree-sitter/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'gnu.org/make': '*',
    'rust-lang.org': '^1.65',
  },

  build: {
    script: [
      'make install PREFIX={{prefix}}',
      { run: 'cargo install --root {{prefix}} --path cli', if: '<0.26' },
      { run: 'cargo install --root {{prefix}} --path crates/cli', if: '>=0.26' },
    ],
  },
}
