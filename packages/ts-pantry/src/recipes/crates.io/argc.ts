import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/argc',
  name: 'argc',
  programs: [
    'argc',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/sigoden/argc/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(argc --argc-version)" = "argc {{version}}"',
      'cat $FIXTURE && bash $FIXTURE -F --bar=xyz --baz a --baz b v1 v2 >test.out',
      'grep \'foo: 1\' test.out',
      'grep \'bar: xyz\' test.out',
      'grep \'baz: a b\' test.out',
      'grep \'val: v1 v2\' test.out',
    ],
  },
}
