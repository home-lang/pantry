import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Diniboy1123/usque',
  name: 'usque',
  programs: [
    'usque',
  ],
  // Download official prebuilt binaries instead of compiling from source.
  // Upstream (goreleaser) ships multi-platform release zips for every version.
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="linux_arm64" ;;',
      '  linux+x86-64)   ASSET="linux_amd64" ;;',
      'esac',
      'URL="https://github.com/Diniboy1123/usque/releases/download/v${VERSION}/usque_${VERSION}_${ASSET}.zip"',
      'curl -Lfo usque.zip "$URL"',
      'unzip -o usque.zip',
      'install -Dm755 usque {{prefix}}/bin/usque',
    ],
  },
}
