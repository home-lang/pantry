import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/libidn',
  name: 'libidn',
  programs: [
    'idn',
  ],
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/libidn/libidn-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'idn "räksmörgås.se" "blåbærgrød.no"',
    ],
  },
}
