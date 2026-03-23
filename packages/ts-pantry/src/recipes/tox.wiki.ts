import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tox.wiki',
  name: 'tox',
  description: 'Command line driven CI frontend and development task automation tool.',
  homepage: 'https://tox.wiki/en/latest/',
  github: 'https://github.com/tox-dev/tox',
  programs: ['tox'],
  versionSource: {
    type: 'github-releases',
    repo: 'tox-dev/tox',
  },
  distributable: {
    url: 'https://github.com/tox-dev/tox/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3.7',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} tox',
    ],
  },
}
