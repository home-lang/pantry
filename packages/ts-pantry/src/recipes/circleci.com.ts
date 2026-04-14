import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'circleci.com',
  name: 'circleci',
  description: 'Enables you to reproduce the CircleCI environment locally',
  homepage: 'https://circleci.com/docs/2.0/local-cli/',
  github: 'https://github.com/CircleCI-Public/circleci-cli',
  programs: ['circleci'],
  versionSource: {
    type: 'github-releases',
    repo: 'CircleCI-Public/circleci-cli',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/CircleCI-Public/circleci-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o {{prefix}}/bin/circleci',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X github.com/CircleCI-Public/circleci-cli/version.packageManager=tea', '-X github.com/CircleCI-Public/circleci-cli/version.Version={{version}}'],
    },
  },
}
