import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gopasspw/gopass',
  name: 'gopass',
  programs: [
    'gopass',
  ],
  // Prebuilt download: gopass (Go) ships official per-platform release archives
  // (`gopass-<ver>-<os>-<arch>.tar.gz`) with the `gopass` binary at top-level.
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="darwin-arm64" ;;',
      '  darwin+x86-64)  PLATFORM="darwin-amd64" ;;',
      '  linux+aarch64)  PLATFORM="linux-arm64"  ;;',
      '  linux+x86-64)   PLATFORM="linux-amd64"  ;;',
      'esac',
      '',
      'URL="https://github.com/gopasspw/gopass/releases/download/v${VERSION}/gopass-${VERSION}-${PLATFORM}.tar.gz"',
      'curl -Lfo gopass.tar.gz "$URL"',
      'tar xf gopass.tar.gz',
      '',
      'install -Dm755 gopass {{prefix}}/bin/gopass',
    ],
  },
  test: {
    script: [
      '[[ "$(gopass --version)" == *{{version}}* ]]',
    ],
  },
}
