import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'sqlfluff.com',
  name: 'sqlfluff',
  description: 'A modular SQL linter and auto-formatter with support for multiple dialects and templated code.',
  homepage: 'https://docs.sqlfluff.com/',
  github: 'https://github.com/sqlfluff/sqlfluff',
  programs: ['sqlfluff'],
  versionSource: {
    type: 'github-releases',
    repo: 'sqlfluff/sqlfluff',
  },
  distributable: {
    url: 'https://github.com/sqlfluff/sqlfluff/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3.7<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/sqlfluff',
      '',
    ],
  },
}
