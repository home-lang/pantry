import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/zsh-users/zsh-autosuggestions',
  name: 'zsh-autosuggestions',
  programs: [],
  distributable: {
    url: 'https://github.com/zsh-users/zsh-autosuggestions/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'install -D zsh-autosuggestions.zsh {{prefix}}/share/zsh-autosuggestions/zsh-autosuggestions.zsh',
    ],
  },
  test: {
    script: [
      'zsh $FIXTURE | grep zsh-autosuggestions',
    ],
  },
}
