import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libunistring',
  name: 'libunistring',
  programs: [],
  dependencies: {
    darwin: {
      'gnu.org/libiconv': '*',
    },
  },
  buildDependencies: {
    'gnu.org/gmp': '*',
    'gnu.org/m4': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libunistring/libunistring-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'cc -o test $FIXTURE -lunistring',
      'test "$(./test)" = "🫖"',
    ],
  },
}
