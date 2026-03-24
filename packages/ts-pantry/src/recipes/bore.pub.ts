import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bore.pub',
  name: 'bore',
  description: 'Modern, simple TCP tunnel in Rust that exposes local ports to a remote server',
  homepage: 'http://bore.pub',
  github: 'https://github.com/ekzhang/bore',
  programs: ['bore'],
  versionSource: {
    type: 'github-releases',
    repo: 'ekzhang/bore',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/ekzhang/bore/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
