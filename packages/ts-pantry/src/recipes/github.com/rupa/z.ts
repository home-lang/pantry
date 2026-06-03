import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/rupa/z',
  name: 'z',
  programs: [],
  distributable: {
    url: 'https://github.com/rupa/z/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'install -D z.sh {{prefix}}/z.sh',
    ],
  },
}
