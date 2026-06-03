import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/source-highlight',
  name: 'source-highlight',
  programs: [
    'check-regexp',
    'source-highlight',
    'source-highlight-settings',
  ],
  dependencies: {
    'boost.org': '*',
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/src-highlite/source-highlight-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--disable-dependency-tracking',
        '--with-boost={{deps.boost.org.prefix}}',
      ],
    },
  },
}
