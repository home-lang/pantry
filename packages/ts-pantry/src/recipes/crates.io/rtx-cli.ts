import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/rtx-cli",
  name: "rtx-cli",
  programs: ['mise', 'rtx'],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: null,
  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="mise-v${VERSION}-macos-arm64.tar.gz" ;;',
      '  darwin+x86-64)  ASSET="mise-v${VERSION}-macos-x64.tar.gz" ;;',
      '  linux+aarch64)  ASSET="mise-v${VERSION}-linux-arm64-musl.tar.gz" ;;',
      '  linux+x86-64)   ASSET="mise-v${VERSION}-linux-x64-musl.tar.gz" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo mise.tar.gz "https://github.com/jdx/mise/releases/download/v${VERSION}/${ASSET}"',
      'tar xzf mise.tar.gz -C {{prefix}} --strip-components=1',
      'ln -sf mise {{prefix}}/bin/rtx',
    ],
  },
  test: {
    script: [
      '{{prefix}}/bin/mise --version > out',
      'grep {{version}} out',
      '{{prefix}}/bin/rtx --version > out',
      'grep {{version}} out',
    ],
  },
}
