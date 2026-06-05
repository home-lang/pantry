import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/caddyserver/xcaddy',
  name: 'xcaddy',
  programs: [
    'xcaddy',
  ],
  dependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/caddyserver/xcaddy/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -trimpath -ldflags="${LDFLAGS}" -o {{prefix}}/bin/xcaddy ./cmd/xcaddy',
    ],
    env: {
      CGO_ENABLED: '0',
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
      'xcaddy build --with github.com/greenpau/caddy-security',
      'test "$($PWD/caddy list-modules | grep security)" = security',
    ],
  },
}
