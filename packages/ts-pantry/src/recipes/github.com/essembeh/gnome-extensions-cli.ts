import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/essembeh/gnome-extensions-cli',
  name: 'gnome-extensions-cli',
  programs: [
    'gnome-extensions-cli',
    'gext',
  ],
  dependencies: {
    'python.org': '>=3.8',
  },
  buildDependencies: {
    'python.org': '>=3.8',
  },
  distributable: {
    url: 'git+https://github.com/essembeh/gnome-extensions-cli.git',
  },
  build: {
    script: [
      'python3 -m pip install --break-system-packages --prefix={{prefix}} .',
    ],
  },
  test: {
    script: [
      'export PYTHONPATH="$(echo {{prefix}}/lib/python*/site-packages)"',
      '{{prefix}}/bin/gext --version',
      'test "$({{prefix}}/bin/gext --version)" = "gext {{version}}"',
    ],
  },
}
