import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'surrealdb.com',
  name: 'surreal',
  description: 'A scalable, distributed, collaborative, document-graph database, for the realtime web',
  homepage: 'https://surrealdb.com',
  github: 'https://github.com/surrealdb/surrealdb',
  programs: ['surreal'],
  versionSource: {
    type: 'github-releases',
    repo: 'surrealdb/surrealdb',
  },
  distributable: {
    url: 'https://github.com/surrealdb/surrealdb/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
    'gnu.org/patch': '*', // rquickjs-sys:build.rs:L132
  },

  build: {
    script: [
      // async state machines can exceed the default recursion limit (128)
      {
        run: 'sed -i -f $PROP lib.rs',
        if: '^3.0.3',
        'working-directory': 'surrealdb/server/src',
        prop: {
          content: '1i #![recursion_limit = "256"]',
        },
      },
      'cargo install --path . --locked --root {{prefix}}',
    ],
    env: {
      SURREAL_BUILD_METADATA: 'pkgx',
      RUSTFLAGS: [
        // required as of v1.4.0
        '--cfg surrealdb_unstable',
      ],
      linux: {
        // Needed to build `generic-array` for some odd reason. Keep the base
        // `--cfg surrealdb_unstable` via shell expansion of $RUSTFLAGS.
        RUSTFLAGS: '$RUSTFLAGS -C linker=cc',
      },
    },
  },

  test: {
    script: [
      'surreal version',
    ],
  },
}
