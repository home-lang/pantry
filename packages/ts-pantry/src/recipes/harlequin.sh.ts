import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'harlequin.sh',
  name: 'harlequin.sh',
  programs: ['harlequin'],
  versionSource: {
    type: 'github-releases',
    repo: 'tconbeer/harlequin',
  },
  distributable: {
    url: 'https://github.com/tconbeer/harlequin/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'unixodbc.org': '*',
  },
  buildDependencies: {
    'python.org': '~3.11',
  },

  build: {
    env: {
      'x86-64': {
        HOMEBREW_PREFIX: '/usr/local',
      },
      'aarch64': {
        HOMEBREW_PREFIX: '/opt/homebrew',
      },
    },
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      // Quote the extras spec: buildkit runs scripts with `shopt -s nullglob`,
      // which treats the unquoted `.[postgres,...]` as a glob pattern that
      // matches no file and expands to nothing, leaving pip with no argument
      // ("ERROR: You must give at least one requirement to install").
      '${{prefix}}/venv/bin/pip install ".[postgres,mysql,odbc,sqlite]"',
      'bkpyvenv seal {{prefix}} harlequin',
      // Library not loaded: /opt/homebrew/opt/unixodbc/lib/libodbc.2.dylib
      {
        run: 'install_name_tool -change ${HOMEBREW_PREFIX}/opt/unixodbc/lib/libodbc.2.dylib {{deps.unixodbc.org.prefix}}/lib/libodbc.2.dylib pyodbc.cpython-311-darwin.so',
        'working-directory': '{{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages',
        if: 'darwin',
      },
    ],
  },
}
