import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pyinvoke.org',
  name: 'invoke',
  description: 'Pythonic task management & command execution.',
  homepage: 'https://www.pyinvoke.org/',
  github: 'https://github.com/pyinvoke/invoke',
  programs: ['invoke'],
  versionSource: {
    type: 'github-releases',
    repo: 'pyinvoke/invoke/tags',
  },
  distributable: {
    url: 'https://github.com/pyinvoke/invoke/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3.13.3',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} invoke',
    ],
  },
}
