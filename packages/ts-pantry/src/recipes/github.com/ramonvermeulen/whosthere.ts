import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ramonvermeulen/whosthere',
  name: 'whosthere',
  programs: [
    'whosthere',
  ],
  buildDependencies: {
    'go.dev': '^1.25.6',
  },
  distributable: {
    url: 'https://github.com/ramonvermeulen/whosthere/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/whosthere .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.versionStr={{version}}',
        '-X main.dateStr=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'whosthere --version',
      'whosthere --interface non_existing 2>&1 | tee out || true',
      'grep "network_interface does not exist" out',
    ],
  },
}
