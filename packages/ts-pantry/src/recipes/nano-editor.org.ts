import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nano-editor.org',
  name: 'nano',
  description: 'Free (GNU) replacement for the Pico text editor',
  homepage: 'https://www.nano-editor.org/',
  programs: ['nano'],
  distributable: {
    url: 'https://www.nano-editor.org/dist/v{{version.major}}/nano-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{prefix}} --enable-utf8',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
