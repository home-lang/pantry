import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/stern/stern',
  name: 'stern',
  programs: [
    'stern',
  ],
  // Prebuilt download: stern ships official per-platform release tarballs
  // (the bare `stern` binary at the archive root).
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="stern_${VERSION}_darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="stern_${VERSION}_darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="stern_${VERSION}_linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="stern_${VERSION}_linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo stern.tar.gz "https://github.com/stern/stern/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf stern.tar.gz',
      'install -Dm755 stern {{prefix}}/bin/stern',
    ],
  },
  test: {
    script: [
      'test "$(stern --version | head -1)" = "version: {{version}}"',
    ],
  },
}
