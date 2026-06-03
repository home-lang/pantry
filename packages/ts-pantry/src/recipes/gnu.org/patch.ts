import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/patch',
  name: 'patch',
  programs: [
    'patch',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/patch/patch-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'echo hello > file',
      'cat $FIXTURE | patch ./file',
      'test "$(cat file)" = goodbye',
    ],
  },
}
