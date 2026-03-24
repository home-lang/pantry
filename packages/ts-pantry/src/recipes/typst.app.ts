import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'typst.app',
  name: 'typst',
  description: 'A new markup-based typesetting system that is powerful and easy to learn.',
  homepage: 'https://typst.app/',
  github: 'https://github.com/typst/typst',
  programs: ['typst'],
  versionSource: {
    type: 'github-releases',
    repo: 'typst/typst/releases/tags',
    tagPattern: /\/^v\d\d-\d\d-\d\d(-\d)?\//,
  },
  distributable: {
    url: 'https://github.com/typst/typst/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.80',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --path cli --locked --root {{prefix}}',
      'cargo install --path crates/typst-cli --locked --root {{prefix}}',
    ],
    env: {
      'TYPST_VERSION': '${{ version }}',
    },
  },
}
