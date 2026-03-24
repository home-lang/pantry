import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pytest.org',
  name: 'pytest',
  description: 'The pytest framework makes it easy to write small tests, yet scales to support complex functional testing',
  homepage: 'https://docs.pytest.org/en/latest/',
  github: 'https://github.com/pytest-dev/pytest',
  programs: ['pytest'],
  versionSource: {
    type: 'github-releases',
    repo: 'pytest-dev/pytest/releases/tags',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/pytest-dev/pytest/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '>=3.7<3.12',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} pytest',
    ],
  },
}
