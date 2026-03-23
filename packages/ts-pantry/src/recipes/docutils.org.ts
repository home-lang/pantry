import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'docutils.org',
  name: 'docutils',
  description: 'Text processing system for reStructuredText',
  homepage: 'https://docutils.sourceforge.io',
  programs: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/docutils/docutils/{{version.marketing}}/docutils-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} $BINS',
    ],
  },
}
