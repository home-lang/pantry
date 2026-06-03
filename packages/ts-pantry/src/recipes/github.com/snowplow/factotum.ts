import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/snowplow/factotum',
  name: 'factotum',
  programs: [
    'factotum',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '~1.78',
    'rust-lang.org/cargo': '~0.80',
  },
  distributable: {
    url: 'https://github.com/snowplow/factotum/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(factotum --version)" = "Factotum version {{version}}"',
      'factotum run $FIXTURE',
    ],
  },
}
