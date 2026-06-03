import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/everywall/ladder',
  name: 'ladder',
  programs: [
    'ladder',
  ],
  buildDependencies: {
    'go.dev': '^1.21.1',
  },
  distributable: {
    url: 'https://github.com/everywall/ladder/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'echo \'{{version}}\' > handlers/VERSION',
      'go build $GO_ARGS -ldflags="$LDFLAGS" ./cmd',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o="{{prefix}}/bin/ladder"',
      ],
      LDFLAGS: [
        '-s',
        '-w',
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
      'ladder -p 8082 &',
      'sleep 1',
      'curl -L http://127.0.0.1:8082/https://pkgx.sh -o test.html',
      '$KILL ladder',
      'cat test.html | grep \'Run Anything\'',
    ],
  },
}
