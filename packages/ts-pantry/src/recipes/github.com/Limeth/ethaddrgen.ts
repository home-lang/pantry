import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Limeth/ethaddrgen',
  name: 'ethaddrgen',
  programs: [
    'ethaddrgen',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Limeth/ethaddrgen/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(ethaddrgen --version)" = "ethaddrgen {{version}}"',
      'ethaddrgen 7ea',
    ],
  },
}
