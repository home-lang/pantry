import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nano-editor.org',
  name: 'nano',
  description: 'Free (GNU) replacement for the Pico text editor',
  homepage: 'https://www.nano-editor.org/',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  distributable: {
    url: 'https://www.nano-editor.org/dist/v{{version.major}}/nano-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for nano-editor.org"',    ],
  },
}
