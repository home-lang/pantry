import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'waterlan.home.xs4all.nl/dos2unix',
  name: 'dos2unix',
  programs: [
    'dos2unix',
    'mac2unix',
    'unix2dos',
    'unix2mac',
  ],
  dependencies: {
    'gnu.org/gettext': '*',
  },
  distributable: {
    url: 'https://waterlan.home.xs4all.nl/dos2unix/dos2unix-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make prefix={{prefix}} ENABLE_NLS=0 install',
    ],
  },
  test: {
    script: [
      'dos2unix --version | grep {{version}}',
      'echo -e "foo\\nbar\\n" > test.txt',
      'unix2mac test.txt',
      'cat test.txt | grep $\'\\x0d\'',
      'mac2unix test.txt',
      'cat test.txt | grep $\'\\x0d\' || true',
      'cat test.txt | grep $\'\\x0a\'',
    ],
  },
}
