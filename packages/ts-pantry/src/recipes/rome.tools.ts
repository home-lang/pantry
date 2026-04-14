import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rome.tools',
  name: 'rome',
  description: 'Unified developer tools for JavaScript, TypeScript, and the web',
  homepage: 'https://docs.rome.tools/',
  github: 'https://github.com/rome/tools',
  programs: ['rome'],
  versionSource: {
    type: 'github-releases',
    repo: 'rome/tools',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/rome/tools/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'sed -i.bak \'s/version = "0.0.0"/version = "{{version}}"/\' Cargo.toml',
      'rm Cargo.toml.bak',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
