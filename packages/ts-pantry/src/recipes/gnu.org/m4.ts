import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/m4',
  name: 'm4',
  programs: [
    'm4',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/m4/m4-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{ prefix }}"',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'OUTPUT=$(cat $FIXTURE | m4)',
      'test $OUTPUT = tea.xyz',
    ],
  },
}
