import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'digip.org/jansson',
  name: 'jansson',
  programs: [],
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/akheron/jansson/releases/download/v{{ version.raw }}/jansson-{{ version.raw }}.tar.gz',
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
      'cc fixture.c -ljansson',
      './a.out',
    ],
  },
}
