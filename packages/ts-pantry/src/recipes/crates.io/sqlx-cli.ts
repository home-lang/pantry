import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/sqlx-cli',
  name: 'sqlx-cli',
  programs: [
    'cargo-sqlx',
    'sqlx',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/launchbadge/sqlx/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path sqlx-cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'sqlx database create',
      'sqlx migrate add create_users_table',
      'sqlx migrate run',
    ],
  },
}
