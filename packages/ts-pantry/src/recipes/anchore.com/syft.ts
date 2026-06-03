import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'anchore.com/syft',
  name: 'syft',
  programs: [
    'syft',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'git+https://github.com/anchore/syft.git',
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/syft',
    ],
    env: {
      COMMIT: '$(git describe --always --abbrev=8 --dirty)',
      DATE: '$(date -u +%FT%TZ)',
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/syft',
      ],
      linux: {
        ARGS: [
          '-buildmode=pie',
        ],
      },
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
        '-X main.gitCommit=${COMMIT}',
        '-X main.buildDate=${DATE}',
      ],
    },
  },
  test: {
    script: [
      'curl -L "${TEST_JSON}" -o micronaut.json',
      'syft convert micronaut.json | grep \'netty-codec-http2\'',
      'syft --version | grep {{version}}',
    ],
  },
}
