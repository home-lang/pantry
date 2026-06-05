import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/greenpau/go-redfish-api-idrac',
  name: 'go-redfish-api-idrac',
  programs: [
    'go-redfish-api-idrac-client',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/greenpau/go-redfish-api-idrac/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o {{ prefix }}/bin/go-redfish-api-idrac-client ./cmd/go-redfish-api-idrac-client/main.go',
    ],
    env: {
      CGO_ENABLED: '0',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/greenpau/go-redfish-api-idrac/cmd.appVersion={{ version }}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
