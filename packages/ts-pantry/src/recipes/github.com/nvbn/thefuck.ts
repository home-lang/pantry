import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/nvbn/thefuck',
  name: 'thefuck',
  programs: [
    'thefuck',
  ],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/nvbn/thefuck/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/thefuck',
    ],
  },
  test: {
    script: [
      'thefuck -y ptyhon --version 2>&1 |',
      '  grep -E \'^The Fuck {{version.marketing}} using',
      '    Python {{deps.python.org.version}} and\'',
    ],
  },
}
