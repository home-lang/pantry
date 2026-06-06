import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/xiph/rav1e',
  name: 'rav1e',
  programs: [
    'rav1e',
  ],
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="rav1e-${VERSION}-macos-aarch64.zip"; ARCHIVE="rav1e.zip" ;;',
      '  darwin+x86-64)  ASSET="rav1e-${VERSION}-macos.zip"; ARCHIVE="rav1e.zip" ;;',
      '  linux+aarch64)  ASSET="rav1e-${VERSION}-linux-aarch64.tar.gz"; ARCHIVE="rav1e.tar.gz" ;;',
      '  linux+x86-64)   ASSET="rav1e-${VERSION}-linux-generic.tar.gz"; ARCHIVE="rav1e.tar.gz" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ARCHIVE" "https://github.com/xiph/rav1e/releases/download/v${VERSION}/${ASSET}"',
      'case "$ARCHIVE" in',
      '  *.zip) unzip -q "$ARCHIVE" ;;',
      '  *.tar.gz) tar xzf "$ARCHIVE" ;;',
      'esac',
      'install -Dm755 rav1e {{prefix}}/bin/rav1e',
    ],
  },
  test: {
    script: [
      '{{prefix}}/bin/rav1e --version | grep {{version}}',
    ],
  },
}
