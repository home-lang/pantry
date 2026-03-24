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

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} poetry',
      'poetry new teaxyz',
      'cd teaxyz',
      'poetry config virtualenvs.in-project true',
      'poetry add requests==2.29.0',
      'poetry add boto3',
      'test -f pyproject.toml',
      'test -f poetry.lock',
    ],
  },
}
