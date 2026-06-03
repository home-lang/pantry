import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/drill',
  name: 'drill',
  programs: [
    'drill',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/fcsonline/drill/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'1,20s/^version = ".*"$/version = {{version}}/\' Cargo.toml',
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(drill --version)" = "drill {{version}}"',
      'drill --benchmark $FIXTURE --stats --timeout 4',
    ],
  },
}
