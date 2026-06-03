import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jjjake/internetarchive',
  name: 'internetarchive',
  programs: [
    'ia',
  ],
  dependencies: {
    'python.org': '~3.11',
    'gnu.org/which': '^2',
  },
  distributable: {
    url: 'https://github.com/jjjake/internetarchive/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/ia',
    ],
  },
  test: {
    script: [
      'ia metadata tigerbrew | grep \'mistydemeo@gmail.com\'',
      'ia --version | grep {{version}}',
    ],
  },
}
