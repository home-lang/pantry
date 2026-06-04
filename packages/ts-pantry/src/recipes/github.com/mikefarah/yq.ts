import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mikefarah/yq',
  name: 'yq',
  programs: [
    'yq',
  ],
  // Prebuilt download: yq ships official per-platform release tarballs
  // (binary named yq_<os>_<arch> at the archive root).
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="yq_darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="yq_darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="yq_linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="yq_linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo yq.tar.gz "https://github.com/mikefarah/yq/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf yq.tar.gz',
      'install -Dm755 "${ASSET}" {{prefix}}/bin/yq',
    ],
  },
}
