import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/promptexecution/just-mcp',
  name: 'just-mcp',
  programs: [
    'just-mcp',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.89',
  },
  distributable: {
    url: 'https://github.com/PromptExecution/just-mcp/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,20s/^version = ".*"$/version = "{{version}}"/\' Cargo.toml',
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
