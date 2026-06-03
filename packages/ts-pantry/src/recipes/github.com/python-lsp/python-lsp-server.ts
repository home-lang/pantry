import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/python-lsp/python-lsp-server',
  name: 'python-lsp-server',
  programs: [
    'pylsp',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/python-lsp/python-lsp-server/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} pylsp',
    ],
  },
}
