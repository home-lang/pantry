import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/equinix-labs/otel-cli',
  name: 'otel-cli',
  programs: [
    'otel-cli',
  ],
  buildDependencies: {
    'go.dev': '~1.21.1',
  },
  distributable: {
    url: 'https://github.com/equinix-labs/otel-cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/otel-cli .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
        '-X main.commit=pkgx',
        '-X main.date=$(date -u +%Y-%m-%dT%H:%M:%SZ)',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
      darwin: {
        GO_LDFLAGS: [
          '-linkmode=external',
        ],
      },
    },
  },
  test: {
    script: [
      'otel-cli status | tee out',
      'test "$(jq -r \'.config.service_name\' out)" = "otel-cli"',
    ],
  },
}
