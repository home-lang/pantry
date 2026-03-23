import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tree-sitter.github.io',
  name: 'tree-sitter',
  description: 'Parser generator tool and incremental parsing library',
  homepage: 'https://tree-sitter.github.io/',
  github: 'https://github.com/tree-sitter/tree-sitter',
  programs: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'tree-sitter/tree-sitter',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/tree-sitter/tree-sitter/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: cargo install --root {{prefix}} --path cli',
      'run: cargo install --root {{prefix}} --path crates/cli',
    ],
  },
}
