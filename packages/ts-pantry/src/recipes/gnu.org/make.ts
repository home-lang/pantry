import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/make',
  name: 'make',
  programs: [
    'make',
  ],
  buildDependencies: {
    'gnu.org/m4': '1',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/make/make-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }} --disable-dependency-tracking',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'make --file=$FIXTURE',
      'test "$(cat foo)" = bar',
      'make --question --file=$FIXTURE',
    ],
  },
}
