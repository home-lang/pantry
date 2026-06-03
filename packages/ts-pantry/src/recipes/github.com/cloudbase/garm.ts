import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cloudbase/garm',
  name: 'garm',
  programs: [
    'garm',
    'garm-cli',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/cloudbase/garm/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="${GO_LDFLAGS}" -o {{ prefix }}/bin/garm ./cmd/garm',
      'go build $ARGS -ldflags="${GO_LDFLAGS}" -o {{ prefix }}/bin/garm-cli ./cmd/garm-cli',
    ],
    env: {
      CGO_ENABLED: 1,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{ version }}',
        '-X github.com/cloudbase/garm/cmd/garm-cli/cmd.Version={{ version }}',
        '-X github.com/cloudbase/garm/util/appdefaults.Version={{ version }}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
      ARGS: [
        '-v',
        '-mod vendor',
      ],
    },
  },
  test: {
    script: [
      'test "$(garm --version)" = {{version}}',
      'garm-cli version | grep {{version}}',
    ],
  },
}
