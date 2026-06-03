import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/rucola-notes',
  name: 'rucola-notes',
  programs: [
    'rucola',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Linus-Mussmaecher/rucola/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
