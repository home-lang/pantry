import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gotestyourself/gotestsum',
  name: 'gotestsum',
  programs: [
    'gotestsum',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
    'git-scm.org': '^2',
  },
  distributable: {
    url: 'git+https://github.com/gotestyourself/gotestsum',
  },
  build: {
    script: [
      'git tag v{{version}} --force',
      'rm -rf props',
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/gotestsum',
      LDFLAGS: [
        '-s',
        '-w',
        '-X gotest.tools/gotestsum/cmd.version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'test "$(gotestsum --version)" = "gotestsum version {{version}}"',
      'test "$(gotestsum --version)" = "gotestsum version v{{version}}"',
    ],
  },
}
