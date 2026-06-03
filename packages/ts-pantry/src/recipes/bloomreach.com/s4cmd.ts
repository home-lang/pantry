import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bloomreach.com/s4cmd',
  name: 's4cmd',
  programs: [
    's4cmd',
  ],
  dependencies: {
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://github.com/bloomreach/s4cmd/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/s4cmd',
    ],
  },
}
