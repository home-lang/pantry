import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/adah1972/libunibreak',
  name: 'libunibreak',
  programs: [],
  distributable: {
    url: 'https://github.com/adah1972/libunibreak/releases/download/libunibreak_{{version.major}}_{{version.minor}}/libunibreak-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion libunibreak | grep {{version.marketing}}',
    ],
  },
}
