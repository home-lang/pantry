import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/lra/mackup',
  name: 'mackup',
  programs: [
    'mackup',
  ],
  dependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/lra/mackup/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/mackup',
    ],
  },
}
