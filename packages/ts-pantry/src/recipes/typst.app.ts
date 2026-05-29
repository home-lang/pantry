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
    repo: 'typst/typst',
    // typst tags are semver (v0.13.1). The old /^v\d\d-\d\d-\d\d/ pattern was a
    // leftover from typst's early date-based versioning and never matches modern
    // tags, producing a bogus version and a 404 download URL.
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/typst/typst/archive/refs/tags/v{{version}}.tar.gz',
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
      { run: 'cargo install --path cli --locked --root {{prefix}}', if: '<0.7' },
      { run: 'cargo install --path crates/typst-cli --locked --root {{prefix}}', if: '>=0.7' },
    ],
    env: {
      'TYPST_VERSION': '${{version}}',
    },
  },
}
