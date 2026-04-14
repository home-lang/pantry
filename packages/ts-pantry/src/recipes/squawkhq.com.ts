import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'squawkhq.com',
  name: 'squawk',
  description: '🐘 linter for PostgreSQL, focused on migrations',
  homepage: 'https://squawkhq.com',
  github: 'https://github.com/sbdchd/squawk',
  programs: ['squawk'],
  versionSource: {
    type: 'github-releases',
    repo: 'sbdchd/squawk',
  },
  distributable: {
    url: 'https://github.com/sbdchd/squawk/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'openssl.org': '*',
    'perl.org': '*',
  },

  build: {
    script: [
      'cd crates/squawk',
      'sed -i \'1,/dependencies/s/version = ".*"/version = "{{ version }}"/\' Cargo.toml',
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
