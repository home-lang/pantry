import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'python-poetry.org',
  name: 'poetry',
  description: 'Python packaging and dependency management made easy',
  homepage: 'https://python-poetry.org/',
  github: 'https://github.com/python-poetry/poetry',
  programs: ['poetry'],
  versionSource: {
    type: 'github-releases',
    repo: 'python-poetry/poetry',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/python-poetry/poetry/releases/download/{{version}}/poetry-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} poetry',
    ],
  },

  test: {
    script: [
      'poetry new teaxyz',
      'cd teaxyz',
      'poetry config virtualenvs.in-project true',
      'poetry add requests',
      'poetry add boto3',
      'test -f pyproject.toml',
      'test -f poetry.lock',
    ],
    env: {
      LC_ALL: 'en_US.UTF-8',
      PYTHON_KEYRING_BACKEND: 'keyring.backends.null.Keyring',
    },
  },
}
