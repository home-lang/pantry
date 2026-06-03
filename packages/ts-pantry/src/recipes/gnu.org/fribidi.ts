import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/fribidi',
  name: 'fribidi',
  programs: [
    'fribidi',
  ],
  distributable: {
    url: 'https://github.com/fribidi/fribidi/releases/download/v{{ version }}/fribidi-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}} --disable-debug',
      'make --jobs={{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'out="$(fribidi --charset=CapRTL --clean --nobreak $FIXTURE)"',
      'test "$out" = "a simple TSet that"',
    ],
  },
}
