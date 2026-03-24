import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'numbat.dev',
  name: 'numbat',
  description: 'A statically typed programming language for scientific computations with first class support for physical dimensions and units',
  homepage: 'https://numbat.dev',
  github: 'https://github.com/sharkdp/numbat',
  programs: ['numbat'],
  versionSource: {
    type: 'github-releases',
    repo: 'sharkdp/numbat',
  },
  distributable: {
    url: 'https://github.com/sharkdp/numbat/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.88',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
