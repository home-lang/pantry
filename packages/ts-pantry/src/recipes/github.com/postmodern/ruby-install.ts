import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/postmodern/ruby-install',
  name: 'ruby-install',
  programs: [
    'ruby-install',
  ],
  dependencies: {
    'tukaani.org/xz': '*',
  },
  distributable: {
    url: 'https://github.com/postmodern/ruby-install/releases/download/v{{version}}/ruby-install-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} install PREFIX={{prefix}}',
    ],
  },
}
