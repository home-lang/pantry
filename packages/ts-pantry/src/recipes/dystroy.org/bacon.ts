import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dystroy.org/bacon',
  name: 'bacon',
  programs: [
    'bacon',
  ],
  dependencies: {
    linux: {
      'alsa-project.org/alsa-lib': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Canop/bacon/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
