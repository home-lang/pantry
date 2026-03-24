import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'caddyserver.com',
  name: 'caddy',
  description: 'Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS',
  homepage: 'https://caddyserver.com/',
  github: 'https://github.com/caddyserver/caddy',
  programs: ['caddy'],
  versionSource: {
    type: 'github-releases',
    repo: 'caddyserver/caddy',
  },
  distributable: {
    url: 'https://github.com/caddyserver/caddy/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
    'curl.se': '*',
  },

  build: {
    script: [
      'cd "xcaddy"',
      'curl -L "$XCADDY" | tar zxf - --strip-components 1',
      'go run cmd/xcaddy/main.go build v{{version}} --output {{prefix}}/bin/caddy',
      '',
    ],
    env: {
      'XCADDY': 'https://github.com/caddyserver/xcaddy/archive/refs/tags/v0.3.5.tar.gz',
    },
  },
}
