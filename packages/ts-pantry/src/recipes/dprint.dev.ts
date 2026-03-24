import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dprint.dev',
  name: 'dprint',
  description: 'Pluggable and configurable code formatting platform written in Rust.',
  homepage: 'https://dprint.dev/',
  github: 'https://github.com/dprint/dprint',
  programs: ['dprint'],
  versionSource: {
    type: 'github-releases',
    repo: 'dprint/dprint',
  },
  distributable: {
    url: 'https://github.com/dprint/dprint/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.91',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
