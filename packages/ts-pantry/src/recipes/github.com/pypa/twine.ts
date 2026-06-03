import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/pypa/twine',
  name: 'twine',
  programs: [
    'twine',
  ],
  dependencies: {
    'python.org': '>=3.7<3.12',
  },
  distributable: {
    url: 'https://github.com/pypa/twine/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/twine',
    ],
  },
  test: {
    script: [
      'twine --version | grep "^twine version {{version}}"',
      '# Create a minimal package',
      'mv $FIXTURE pyproject.toml',
      'echo "Hello World" > README.md',
      '# Build the package',
      '{{prefix}}/venv/bin/pip install --upgrade build',
      '{{prefix}}/venv/bin/python -m build',
      '# check the package',
      'twine check dist/*',
      '# clean up',
      'rm -rf dist',
    ],
  },
}
