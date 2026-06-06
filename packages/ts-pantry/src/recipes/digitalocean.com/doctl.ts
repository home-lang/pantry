import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'digitalocean.com/doctl',
  name: 'doctl',
  programs: [
    'doctl',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'digitalocean/doctl',
  },
  // Prebuilt download: doctl (Go) ships official per-platform release tarballs
  // (`doctl-<ver>-<os>-<arch>.tar.gz`) containing a single flat `doctl` binary.
  // It's a vanilla Go CLI with no build-time configuration we customize, so the
  // official prebuilt is identical to what we'd compile.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="linux-amd64"  ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -Lfo doctl.tar.gz "https://github.com/digitalocean/doctl/releases/download/v${VERSION}/doctl-${VERSION}-${ASSET}.tar.gz"',
      'tar xzf doctl.tar.gz',
      'install -Dm755 doctl {{prefix}}/bin/doctl',
    ],
  },

  test: {
    script: [
      'doctl version | grep {{version}}',
      'doctl help | grep \'doctl is a command line interface (CLI) for the DigitalOcean API\'',
    ],
  },
}
