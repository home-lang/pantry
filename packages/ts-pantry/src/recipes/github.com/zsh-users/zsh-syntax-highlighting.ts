import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/zsh-users/zsh-syntax-highlighting',
  name: 'zsh-syntax-highlighting',
  programs: [],
  distributable: {
    url: 'https://github.com/zsh-users/zsh-syntax-highlighting/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} install PREFIX="{{prefix}}"',
      'mkdir {{prefix}}/share/zsh-syntax-highlighting/tests {{prefix}}/share/zsh-syntax-highlighting/highlighters/main/test-data',
      'cp -r ./tests/* {{prefix}}/share/zsh-syntax-highlighting/tests',
      'cp ./highlighters/main/test-data/alias-basic.zsh {{prefix}}/share/zsh-syntax-highlighting/highlighters/main/test-data',
    ],
  },
}
