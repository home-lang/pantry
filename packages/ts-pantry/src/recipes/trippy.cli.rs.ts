import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'trippy.cli.rs',
  name: 'trip',
  description: 'Network diagnostic tool, inspired by mtr',
  homepage: 'https://trippy.cli.rs/',
  github: 'https://github.com/fujiapple852/trippy',
  programs: ['trip'],
  versionSource: {
    type: 'github-releases',
    repo: 'fujiapple852/trippy',
  },
  distributable: {
    url: 'https://github.com/fujiapple852/trippy/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install $CARGO_ARGS --path .',
      'cargo install $CARGO_ARGS --path crates/trippy',
    ],
    env: {
      'CARGO_ARGS': ['--locked', '--root="{{prefix}}"'],
    },
  },
}
