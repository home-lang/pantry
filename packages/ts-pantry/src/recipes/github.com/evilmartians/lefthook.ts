import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/evilmartians/lefthook',
  name: 'lefthook',
  programs: [
    'lefthook',
  ],
  // Prebuilt download: lefthook (Go) ships official per-platform release assets
  // as a single gzipped binary (`lefthook_<ver>_<OS>_<arch>.gz`).
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="lefthook_${VERSION}_MacOS_arm64"  ;;',
      '  darwin+x86-64)  ASSET="lefthook_${VERSION}_MacOS_x86_64" ;;',
      '  linux+aarch64)  ASSET="lefthook_${VERSION}_Linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="lefthook_${VERSION}_Linux_x86_64" ;;',
      'esac',
      '',
      'URL="https://github.com/evilmartians/lefthook/releases/download/v${VERSION}/${ASSET}.gz"',
      'curl -Lfo lefthook.gz "$URL"',
      'gunzip --force lefthook.gz',
      '',
      'install -Dm755 lefthook {{prefix}}/bin/lefthook',
    ],
  },
  test: {
    script: [
      '[[ "$(lefthook version)" == *{{version}}* ]]',
    ],
  },
}
