import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hjson.github.io',
  name: 'hjson',
  description: 'Hjson for Rust',
  homepage: 'https://hjson.github.io/',
  github: 'https://github.com/hjson/hjson-rust',
  programs: ['hjson'],
  versionSource: {
    type: 'github-releases',
    repo: 'hjson/hjson-rust',
  },
  distributable: {
    url: 'https://github.com/hjson/hjson-rust/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path hjson_cli --root {{prefix}}',
    ],
  },
}
