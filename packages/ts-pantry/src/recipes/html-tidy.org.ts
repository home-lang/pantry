import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'html-tidy.org',
  name: 'tidy',
  description: 'The granddaddy of HTML tools, with support for modern standards',
  homepage: 'https://www.html-tidy.org/',
  github: 'https://github.com/htacg/tidy-html5',
  programs: ['', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'htacg/tidy-html5',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/htacg/tidy-html5/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for html-tidy.org"',    ],
  },
}
