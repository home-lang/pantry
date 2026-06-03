import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cloudflare.com/cloudflared',
  name: 'cloudflared',
  programs: [
    'cloudflared',
  ],
  buildDependencies: {
    'go.dev': '~1.24',
  },
  distributable: {
    url: 'https://github.com/cloudflare/cloudflared/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s|go build|go build -buildmode=pie|g\' Makefile',
        if: 'linux',
      },
      'make cloudflared $ARGS',
      'mkdir -p {{prefix}}/bin',
      'install -Dm755 cloudflared {{prefix}}/bin/',
    ],
    env: {
      DATE: '$(date -u +%FT%TZ)',
      ARGS: [
        'VERSION={{version}}',
        'DATE=${DATE}',
        'PACKAGE_MANAGER=pkgx',
        'PREFIX={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'cloudflared help | grep {{version}}',
      'cloudflared update 2>&1 | grep \'cloudflared was installed by pkgx\'',
    ],
  },
}
