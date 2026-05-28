import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rust-script.org',
  name: 'rust-script',
  description: 'Run Rust files and expressions as scripts without any setup or compilation step.',
  homepage: 'https://rust-script.org',
  github: 'https://github.com/fornwall/rust-script',
  programs: ['rust-script'],
  versionSource: {
    type: 'github-releases',
    repo: 'fornwall/rust-script',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/fornwall/rust-script/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'rust-lang.org': '>=1.64',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
