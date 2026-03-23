import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'starship.rs',
  name: 'starship',
  description: '☄🌌️  The minimal, blazing-fast, and infinitely customizable prompt for any shell!',
  homepage: 'https://starship.rs',
  github: 'https://github.com/starship/starship',
  programs: ['starship'],
  versionSource: {
    type: 'github-releases',
    repo: 'starship/starship/tags',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/starship/starship/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '>=3.5',
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
