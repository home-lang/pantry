import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mycreepy/fsdiff',
  name: 'fsdiff',
  programs: [
    'fsdiff',
  ],
  // Download official prebuilt binaries instead of compiling from source.
  // Upstream (goreleaser) ships multi-platform release tarballs for every version.
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="linux_arm64" ;;',
      '  linux+x86-64)   ASSET="linux_amd64" ;;',
      'esac',
      'URL="https://github.com/mycreepy/fsdiff/releases/download/v${VERSION}/fsdiff_${VERSION}_${ASSET}.tar.gz"',
      'curl -Lfo fsdiff.tar.gz "$URL"',
      'tar xzf fsdiff.tar.gz',
      'install -Dm755 fsdiff {{prefix}}/bin/fsdiff',
    ],
  },
  test: {
    script: [
      'fsdiff -v | grep {{version}}',
    ],
  },
}
