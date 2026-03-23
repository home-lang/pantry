import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'micro-editor.github.io',
  name: 'micro',
  description: 'A modern and intuitive terminal-based text editor',
  homepage: 'https://micro-editor.github.io',
  github: 'https://github.com/zyedidia/micro',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'zyedidia/micro',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/zyedidia/micro/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for micro-editor.github.io"',    ],
  },
}
