import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'amp.rs',
  name: 'amp',
  description: 'A complete text editor for your terminal.',
  homepage: 'https://amp.rs',
  github: 'https://github.com/jmacdonald/amp',
  programs: ['amp'],
  versionSource: {
    type: 'github-releases',
    repo: 'jmacdonald/amp',
  },
  distributable: {
    url: 'https://github.com/jmacdonald/amp/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '1',
    'libgit2.org': '1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cd "src"',
      'sed -f $PROP main.rs > main.rs.new && mv main.rs.new main.rs',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
