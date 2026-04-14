import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'virtualenv.pypa.io',
  name: 'virtualenv',
  description: 'Tool for creating isolated virtual python environments',
  homepage: 'https://virtualenv.pypa.io/',
  github: 'https://github.com/pypa/virtualenv',
  programs: ['virtualenv'],
  versionSource: {
    type: 'github-releases',
    repo: 'pypa/virtualenv',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/pypa/virtualenv/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'libexpat.github.io': '^2',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'python.org': '>=3.7<3.12',
  },

  build: {
    script: [
      'bkpyvenv stage \'{{prefix}}\' {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal \'{{prefix}}\' virtualenv',
      'cd "${{prefix}}/lib"',
      'cp {{deps.python.org.prefix}}/lib/libpython{{deps.python.org.version.marketing}}.so* .',
    ],
  },
}
