import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kaspanet/kaspad',
  name: 'kaspad',
  programs: [],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/kaspanet/kaspad/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go install -ldflags="$LDFLAGS" . ./cmd/...',
    ],
    env: {
      GOBIN: '{{prefix}}/bin',
      LDFLAGS: [
        '-X=main.Version=v{{version}}',
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
      'kaspawallet show-addresses || true',
      'echo $(kaspawallet show-addresses 2>&1 || true) | grep "kaspawallet daemon is not running, start it with"',
    ],
  },
}
