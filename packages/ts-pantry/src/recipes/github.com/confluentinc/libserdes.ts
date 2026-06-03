import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/confluentinc/libserdes',
  name: 'libserdes',
  programs: [],
  dependencies: {
    'apache.org/avro': '*',
    'digip.org/jansson': '*',
    'curl.se': '*',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://github.com/confluentinc/libserdes/archive/refs/tags/v7.5.2-rc231027084844.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'cc test.c -lserdes -o test',
      './test',
    ],
  },
}
