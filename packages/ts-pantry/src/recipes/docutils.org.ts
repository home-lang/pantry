import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'docutils.org',
  name: 'docutils',
  description: 'Text processing system for reStructuredText',
  homepage: 'https://docutils.sourceforge.io',
  programs: ['docutils', 'rst2html', 'rst2html4', 'rst2html5', 'rst2latex', 'rst2man', 'rst2odt', 'rst2pseudoxml', 'rst2s5', 'rst2xetex', 'rst2xml'],
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
