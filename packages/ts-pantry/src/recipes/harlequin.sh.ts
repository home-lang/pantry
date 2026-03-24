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
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '{{prefix}}/venv/bin/pip install ".[postgres,mysql,odbc,sqlite]"',
      'bkpyvenv seal {{prefix}} harlequin',
      'cd "{{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages"',
      'PYODBC=$(find {{prefix}}/venv/lib -name \'pyodbc.cpython-*-darwin.so\' 2>/dev/null | head -1)',
      'if [ -n "$PYODBC" ]; then',
      '  install_name_tool -change ${HOMEBREW_PREFIX}/opt/unixodbc/lib/libodbc.2.dylib {{deps.unixodbc.org.prefix}}/lib/libodbc.2.dylib "$PYODBC"',
      'fi',
    ],
  },
}
