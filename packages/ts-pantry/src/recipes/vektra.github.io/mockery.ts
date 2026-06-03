import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vektra.github.io/mockery',
  name: 'mockery',
  programs: [
    'mockery',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/vektra/mockery/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/mockery',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/vektra/mockery/v2/pkg/logging.SemVer=v{{version}}',
        '-X github.com/vektra/mockery/v3/internal/logging.SemVer=v{{version}}',
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
      'mockery --version | grep {{version}}',
      'mockery version | grep {{version}}',
    ],
  },
}
