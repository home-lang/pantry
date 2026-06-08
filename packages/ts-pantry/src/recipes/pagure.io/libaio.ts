import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pagure.io/libaio',
  platforms: ['linux'],
  name: 'libaio',
  programs: [],
  distributable: {
    url: 'https://pagure.io/libaio/archive/libaio-0.3.113/libaio-libaio-0.3.113.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make',
      'make prefix={{prefix}} install',
    ],
  },
  test: {
    script: [
      'cc $FIXTURE -laio -o test',
      './test',
    ],
  },
}
