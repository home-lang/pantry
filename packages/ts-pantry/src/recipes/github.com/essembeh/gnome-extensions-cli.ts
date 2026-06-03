import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/essembeh/gnome-extensions-cli',
  name: 'gnome-extensions-cli',
  programs: [
    'gnome-extensions-cli',
    'gext',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.11',
    'python-poetry.org': '^1',
  },
  distributable: {
    url: 'git+https://github.com/essembeh/gnome-extensions-cli.git',
  },
  build: {
    script: [
      'bkpyvenv stage --engine=poetry {{prefix}} {{version}}',
      'poetry install',
      'bkpyvenv seal --engine=poetry {{prefix}} gnome-extensions-cli gext',
    ],
  },
  test: {
    script: [
      'test "$(gext --version)" = "gext {{version}}"',
      'gext search code',
    ],
  },
}
