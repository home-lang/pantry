import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceforge.net/opencore-amr',
  name: 'opencore-amr',
  programs: [
    'aac-enc',
  ],
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/opencore-amr/fdk-aac/fdk-aac-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--enable-example',
      ],
    },
  },
  test: {
    script: [
      'aac-enc test.wav test.aac',
      'ls | grep test.aac',
    ],
  },
}
