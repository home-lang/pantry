import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'prql-lang.org',
  name: 'prql',
  description: 'PRQL is a modern language for transforming data — a simple, powerful, pipelined SQL replacement',
  homepage: 'https://prql-lang.org',
  github: 'https://github.com/PRQL/prql',
  programs: ['prql-compiler', 'prqlc'],
  versionSource: {
    type: 'github-tags',
    repo: 'PRQL/prql',
  },
  distributable: {
    url: 'https://github.com/PRQL/prql/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
    linux: {
      'llvm.org': '18', // 19 has template issues with duckdb build
    },
  },

  build: {
    script: [
      { run: 'cargo install --path prql-compiler --root {{prefix}}', if: '<0.4.0' },
      { run: 'cargo install --path prql-compiler --root {{prefix}} --all-features', if: '=0.4.0' },
      { run: 'cargo install --path prql-compiler/prqlc --root {{prefix}}', if: '>=0.4.1<0.9.0' },
      { run: 'cargo install --path crates/prqlc --root {{prefix}} --all-features', if: '>=0.9.0<0.10.0' },
      { run: 'cargo install --path prqlc/prqlc --root {{prefix}} --locked --all-features', if: '>=0.10.0' },

      // Bin got renamed; this is one way to keep ourselves working
      { run: 'ln -s prql-compiler prqlc', 'working-directory': '{{prefix}}/bin', if: '<0.4.0' },
      { run: 'ln -s prqlc prql-compiler', 'working-directory': '{{prefix}}/bin', if: '>=0.4.0' },
    ],
    env: {
      linux: {
        AR: 'llvm-ar',
      },
    },
  },
}
