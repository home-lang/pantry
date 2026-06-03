import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/edenhill/kcat',
  name: 'kcat',
  programs: [
    'kcat',
  ],
  dependencies: {
    'apache.org/avro': '*',
    'github.com/confluentinc/librdkafka': '*',
    'github.com/confluentinc/libserdes': '*',
    'lloyd.github.io/yajl': '*',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://github.com/edenhill/kcat/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-json',
        '--enable-avro',
      ],
    },
  },
  test: {
    script: [
      'kcat -X list',
    ],
  },
}
