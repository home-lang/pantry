import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/tfutils/tfenv',
  name: 'tfenv',
  programs: [
    'tfenv',
  ],
  dependencies: {
    'gnu.org/grep': '*',
  },
  distributable: {
    url: 'https://github.com/tfutils/tfenv/archive/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{ prefix }}',
      'cp -R bin lib libexec share CHANGELOG.md "{{ prefix }}"',
    ],
  },
}
