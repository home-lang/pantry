import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/postmodern/chruby',
  name: 'chruby',
  programs: [
    'chruby-exec',
  ],
  distributable: {
    url: 'https://github.com/postmodern/chruby/releases/download/v{{version}}/chruby-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
