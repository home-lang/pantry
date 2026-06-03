import type { Recipe } from '../../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/hykilpikonna/hyfetch/neowofetch',
  name: 'neowofetch',
  programs: [
    'neowofetch',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  distributable: {
    url: 'https://github.com/hykilpikonna/hyfetch/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p \'{{prefix}}/bin\'',
      'install neofetch \'{{prefix}}/bin/neowofetch\'',
    ],
  },
}
