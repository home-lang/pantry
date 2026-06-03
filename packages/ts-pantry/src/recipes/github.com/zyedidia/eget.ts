import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/zyedidia/eget',
  name: 'eget',
  programs: [
    'eget',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '*',
    'pandoc.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/zyedidia/eget',
  },
  build: {
    script: [
      'go build -ldflags="$LDFLAGS" $ARGS',
    ],
    env: {
      ARGS: [
        '-v',
        '-trimpath',
        '-o',
        '${{prefix}}/bin/eget',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
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
      'eget --version | grep {{version}}',
      'eget zyedidia/eget $ARGS',
      './eget --version | grep 1.1.0',
    ],
  },
}
