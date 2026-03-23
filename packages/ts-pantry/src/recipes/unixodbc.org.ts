import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'unixodbc.org',
  name: 'unixodbc',
  description: 'The unixODBC Project goals are to develop and promote unixODBC to be the definitive standard for ODBC on non MS Windows platforms.',
  homepage: 'https://www.unixodbc.org/',
  github: 'https://github.com/lurcher/unixODBC',
  programs: ['dltest', 'isql', 'iusql', 'odbc_config', 'odbcinst', 'slencheck'],
  versionSource: {
    type: 'github-releases',
    repo: 'lurcher/unixODBC',
  },
  distributable: {
    url: 'https://github.com/lurcher/unixODBC/releases/download/{{version.tag}}/unixODBC-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/libtool': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-debug', '--disable-dependency-tracking', '--enable-static', '--enable-gui=no'],
    },
  },
}
