import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mypy-lang.org',
  name: 'mypy-lang',
  description: 'Experimental optional static type checker for Python',
  homepage: 'https://www.mypy-lang.org/',
  github: 'https://github.com/python/mypy',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'python/mypy',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/python/mypy/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} mypy',
      'run: |',
    ],
  },
}
