import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gleam.run',
  name: 'gleam',
  description: '⭐️ A friendly language for building type-safe, scalable systems!',
  homepage: 'https://gleam.run',
  github: 'https://github.com/gleam-lang/gleam',
  programs: ['gleam'],
  versionSource: {
    type: 'github-releases',
    repo: 'gleam-lang/gleam',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/gleam-lang/gleam/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '>=0.86',
  },

  build: {
    script: [
      'cargo install --path compiler-cli --force --locked --root {{prefix}}',
      'cargo install --path gleam-bin --force --locked --root {{prefix}}',
    ],
  },
}
