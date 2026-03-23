import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'litecli.com',
  name: 'litecli',
  description: 'CLI for SQLite Databases with auto-completion and syntax highlighting',
  homepage: 'https://litecli.com',
  github: 'https://github.com/dbcli/litecli',
  programs: ['litecli'],
  versionSource: {
    type: 'github-releases',
    repo: 'dbcli/litecli/tags',
  },
  distributable: {
    url: 'https://github.com/dbcli/litecli/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'sqlite.org': '^3.45',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} litecli',
    ],
  },
}
