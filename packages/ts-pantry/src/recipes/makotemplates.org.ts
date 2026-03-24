import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'makotemplates.org',
  name: 'mako-render',
  description: 'Mako Templates for Python',
  homepage: 'https://www.makotemplates.org',
  github: 'https://github.com/sqlalchemy/mako',
  programs: ['mako-render'],
  versionSource: {
    type: 'github-releases',
    repo: 'sqlalchemy/mako/releases',
    tagPattern: /\/rel_\//,
  },
  distributable: {
    url: 'https://github.com/sqlalchemy/mako/archive/rel_{{version.major}}_{{version.minor}}_{{version.patch}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/mako-render',
    ],
  },
}
