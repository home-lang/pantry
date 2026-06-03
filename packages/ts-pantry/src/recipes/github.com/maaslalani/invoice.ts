import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/maaslalani/invoice',
  name: 'invoice',
  programs: [
    'invoice',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/maaslalani/invoice/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/invoice\' .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
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
      'invoice generate --from "Dream, Inc." --to "Imagine, Inc." --item "Rubber Duck" --quantity 2 --rate 25 --tax 0.13 --discount 0.15 --note "For debugging purposes"',
      'test -s invoice.pdf',
    ],
  },
}
