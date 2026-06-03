import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gitlab.com/gitlab-org/gitlab-runner',
  name: 'gitlab-runner',
  programs: [
    'gitlab-runner',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://gitlab.com/gitlab-org/gitlab-runner/-/archive/v{{version}}/gitlab-runner-v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $GO_ARGS -ldflags="$GO_LDFLAGS"',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/gitlab-runner',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X gitlab.com/gitlab-org/gitlab-runner/common.NAME=gitlab-runner',
        '-X gitlab.com/gitlab-org/gitlab-runner/common.VERSION={{version}}',
        '-X gitlab.com/gitlab-org/gitlab-runner/common.BRANCH={{version.major}}-{{version.minor}}-stable',
        '-X gitlab.com/gitlab-org/gitlab-runner/common.BUILT=$(date -Iseconds)',
        '-buildmode=pie',
      ],
      GO111MODULE: 'on',
    },
  },
  test: {
    script: [
      'gitlab-runner --version | grep {{version}}',
    ],
  },
}
