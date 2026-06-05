import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'go.dev/govulncheck',
  name: 'govulncheck',
  programs: [
    'govulncheck',
  ],
  buildDependencies: {
    'go.dev': '^1.23',
  },
  distributable: {
    url: 'https://github.com/golang/vuln/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/govulncheck ./cmd/govulncheck',
    ],
    env: {
      CGO_ENABLED: '0',
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
      'go mod init vuln.tutorial',
      'cp $FIXTURE main.go',
      'go mod tidy',
      'go get golang.org/x/text@v0.3.5',
      '(govulncheck ./... 2>&1 || true) | grep GO-2021-0113',
    ],
  },
}
