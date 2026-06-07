import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pimalaya.org/himalaya',
  name: 'himalaya',
  programs: [
    'himalaya',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/pimalaya/himalaya/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    // pkgx gates the test by version: <1 expects "himalaya {{version}}", >=1
    // expects "himalaya v{{version}}". All current releases are 1.x, so mirror
    // the >=1 form only (the <1 form would falsely fail the health check on 1.x).
    script: [
      'himalaya --version | grep "himalaya v{{version}}"',
    ],
  },
}
