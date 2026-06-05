import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'versity.com/versitygw',
  name: 'versitygw',
  programs: [
    'versitygw',
  ],
  buildDependencies: {
    'go.dev': '1.21.0',
  },
  distributable: {
    url: 'https://github.com/versity/versitygw/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags "${LDFLAGS}" -o {{prefix}}/bin/versitygw ./cmd/versitygw',
    ],
    env: {
      CGO_ENABLED: '0',
      LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Build=$( git rev-parse HEAD )',
        '-X=main.BuildTime=$( date --iso-8601=seconds )',
        '-X=main.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
