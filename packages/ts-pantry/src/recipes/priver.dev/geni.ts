import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'priver.dev/geni',
  name: 'geni',
  programs: [
    'geni',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/emilpriver/geni/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -e \'s/^version = ".*"/version = "{{version}}"/\' Cargo.toml',
      },
      {
        run: 'sed -i -e \'s/"0\\.0\\.3"/{{version}}/\' main.rs',
        if: '=0.0.4',
        'working-directory': 'src',
      },
      'cargo install --path . --locked --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(geni --version)" = "geni v{{version}}"',
      'geni new test',
      'cat $FIXTURE >> migrations/*_test.up.sql',
      'cat $FIXTURE >> migrations/*_test.down.sql',
      'geni up',
      'geni down',
    ],
  },
}
