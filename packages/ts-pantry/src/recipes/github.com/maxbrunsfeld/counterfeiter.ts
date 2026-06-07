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
  versionSource: {
    type: 'github-releases',
    repo: 'maxbrunsfeld/counterfeiter',
    tagPattern: /^v(.+)$/,
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
}
