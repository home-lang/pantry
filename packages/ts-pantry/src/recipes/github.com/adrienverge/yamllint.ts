import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/adrienverge/yamllint',
  name: 'yamllint',
  programs: [
    'yamllint',
  ],
  dependencies: {
    'python.org': '~3.11',
    'pyyaml.org': '*',
  },
  distributable: {
    url: 'https://github.com/adrienverge/yamllint/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/yamllint',
    ],
  },
}
