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
  // Prebuilt download: caddy (Go) ships official per-platform release archives
  // (`caddy_<ver>_<os>_<arch>.tar.gz`). The recipe builds the vanilla caddy
  // binary with no extra plugins, so the official prebuilt is identical.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="mac_arm64"   ;;',
      '  darwin+x86-64)  PLATFORM="mac_amd64"   ;;',
      '  linux+aarch64)  PLATFORM="linux_arm64" ;;',
      '  linux+x86-64)   PLATFORM="linux_amd64" ;;',
      'esac',
      '',
      'URL="https://github.com/caddyserver/caddy/releases/download/v${VERSION}/caddy_${VERSION}_${PLATFORM}.tar.gz"',
      'curl -Lfo caddy.tar.gz "$URL"',
      'tar xf caddy.tar.gz',
      '',
      'install -Dm755 caddy {{prefix}}/bin/caddy',
    ],
  },

  test: {
    script: [
      'caddy version',
    ],
  },
}
