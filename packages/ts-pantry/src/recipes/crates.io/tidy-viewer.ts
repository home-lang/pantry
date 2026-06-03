import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/tidy-viewer',
  name: 'tidy-viewer',
  programs: [
    'tidy-viewer',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/alexhallam/tv/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cargo install --locked --path . --root {{prefix}}',
        if: '<1.8.92',
      },
      {
        run: 'cargo install --locked --path tidy-viewer-cli --root {{prefix}}',
        if: '>=1.8.92',
      },
    ],
  },
}
