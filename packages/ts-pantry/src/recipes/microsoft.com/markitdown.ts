import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/markitdown',
  name: 'markitdown',
  programs: [
    'markitdown',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
  },
  distributable: {
    url: 'https://github.com/microsoft/markitdown/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} markitdown',
    ],
  },
  test: {
    script: [
      'markitdown --help',
      'markitdown test.docx > test.md',
      'grep \'Welcome to pkgx\' test.md',
    ],
  },
}
