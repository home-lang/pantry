import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/maxbrunsfeld/counterfeiter',
  name: 'counterfeiter',
  programs: [
    'counterfeiter',
  ],
  dependencies: {
    'go.dev': '*',
  },
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/maxbrunsfeld/counterfeiter/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/counterfeiter',
      ],
    },
  },
  test: {
    script: [
      'counterfeiter -p os 2>&1',
      'test -e osshim',
    ],
  },
}
