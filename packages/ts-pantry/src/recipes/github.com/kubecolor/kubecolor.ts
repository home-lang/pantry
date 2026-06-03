import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kubecolor/kubecolor',
  name: 'kubecolor',
  programs: [
    'kubecolor',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/kubecolor/kubecolor/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" .',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/kubecolor',
      ],
      linux: {
        ARGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'kubecolor --kubecolor-version | grep {{version}}',
    ],
  },
}
