import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/qsv',
  name: 'qsv',
  programs: [
    'qsv',
  ],
  dependencies: {
    linux: {
      'wayland.freedesktop.org': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '^0.86',
    'cmake.org': '^3',
    'python.org': '>=3.8',
  },
  distributable: {
    url: 'https://github.com/dathere/qsv/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $CARGO_ARGS',
    ],
    env: {
      CARGO_ARGS: [
        '--locked',
        '--features feature_capable,apply,luau,clipboard,fetch,foreach,geocode,prompt,sled,to',
        '--path .',
        '--root {{prefix}}',
      ],
      'darwin/x86-64': {
        RUSTFLAGS: [
          '-C target-cpu=generic',
        ],
      },
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.csv',
      'qsv sort -s a -R -N test.csv',
      'test $(qsv count test.csv) -eq 5',
      'qsv dedup -q test.csv',
      'test $(qsv dedup -q test.csv | qsv count) -eq 4',
      'sed \'s/4,5,6/4,5,7/\' test.csv > test-diff.csv',
      'qsv diff test.csv test-diff.csv',
      'qsv diff test.csv test-diff.csv | qsv count | tee out',
      'test $(cat out) -eq 2 || test $(cat out) -eq 3',
    ],
  },
}
