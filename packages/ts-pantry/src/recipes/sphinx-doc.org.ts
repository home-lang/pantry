import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sphinx-doc.org',
  name: 'sphinx',
  description: 'Tool to create intelligent and beautiful documentation',
  homepage: 'https://www.sphinx-doc.org/',
  github: 'https://github.com/sphinx-doc/sphinx',
  programs: ['sphinx-apidoc', 'sphinx-autogen', 'sphinx-build', 'sphinx-quickstart'],
  versionSource: {
    type: 'github-releases',
    repo: 'sphinx-doc/sphinx',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/sphinx-doc/sphinx/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} sphinx-apidoc sphinx-autogen sphinx-build sphinx-quickstart',
    ],
  },
}
