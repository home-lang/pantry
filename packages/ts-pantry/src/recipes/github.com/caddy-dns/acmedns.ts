import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/caddy-dns/acmedns',
  name: 'acmedns',
  programs: [
    'caddy-acmedns',
  ],
  buildDependencies: {
    'github.com/caddyserver/xcaddy': '*',
  },
  distributable: undefined,
  build: {
    script: [
      'xcaddy build --with github.com/lucaslorentz/caddy-docker-proxy/v2 --with github.com/caddy-dns/acmedns@{{version.tag}} --output {{prefix}}/bin/caddy-acmedns',
    ],
  },
}
