import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'volta.sh',
  name: 'volta',
  description: 'JavaScript toolchain manager for reproducible environments',
  homepage: 'https://volta.sh',
  github: 'https://github.com/volta-cli/volta',
  programs: ['volta'],
  versionSource: {
    type: 'github-releases',
    repo: 'volta-cli/volta',
  },
  distributable: {
    url: 'https://github.com/volta-cli/volta/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '^1.75',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'rm -f rust-toolchain.toml',
      'sed -i.bak \'s/version = "=2.1.6"/version = "2.1"/\' crates/archive/Cargo.toml',
      'rm -f crates/archive/Cargo.toml.bak',
      'rm -f Cargo.lock',
      'rustup default stable',
      'cargo install $ARGS',
    ],
    env: {
      'ARGS': ['--root={{prefix}}', '--path=.'],
    },
  },
}
