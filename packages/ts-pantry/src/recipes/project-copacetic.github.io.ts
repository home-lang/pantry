import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'project-copacetic.github.io',
  name: 'copa',
  description: 'Tool to directly patch container images given the vulnerability scanning results',
  homepage: 'https://project-copacetic.github.io/copacetic/',
  github: 'https://github.com/project-copacetic/copacetic',
  programs: ['copa'],
  versionSource: {
    type: 'github-releases',
    repo: 'project-copacetic/copacetic',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/project-copacetic/copacetic.git',
    // Pin the checkout to the release tag so `git describe` and the version
    // ldflags resolve to the version being built.
    ref: 'v{{version}}',
  },

  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/copa',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/project-copacetic/copacetic/pkg/version.GitVersion=v{{version}}',
        '-X main.version={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
