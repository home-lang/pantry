import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/koekeishiya/skhd',
  name: 'skhd',
  programs: [
    'skhd',
  ],
  distributable: {
    url: 'https://github.com/koekeishiya/skhd/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install',
      'install -D bin/skhd {{prefix}}/bin/skhd',
    ],
  },
}
