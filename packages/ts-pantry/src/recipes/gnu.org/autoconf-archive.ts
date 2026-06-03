import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/autoconf-archive',
  name: 'autoconf-archive',
  programs: [],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/autoconf-archive/autoconf-archive-{{ version.raw }}.tar.xz',
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
      'echo $TESTM4 >test.m4',
      'autoconf test.m4',
    ],
  },
}
