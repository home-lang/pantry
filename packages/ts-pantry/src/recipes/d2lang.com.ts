import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'd2lang.com',
  name: 'd2',
  description: 'D2 is a modern diagram scripting language that turns text to diagrams.',
  homepage: 'https://d2lang.com/',
  github: 'https://github.com/terrastruct/d2',
  programs: ['d2'],
  versionSource: {
    type: 'github-releases',
    repo: 'terrastruct/d2',
  },
  // Prebuilt download: d2 ships official per-platform release tarballs
  // (macos/linux OS tokens; binary under d2-v<version>/bin/d2).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="d2-v${VERSION}-macos-arm64" ;;',
      '  darwin+x86-64)  ASSET="d2-v${VERSION}-macos-amd64" ;;',
      '  linux+aarch64)  ASSET="d2-v${VERSION}-linux-arm64" ;;',
      '  linux+x86-64)   ASSET="d2-v${VERSION}-linux-amd64" ;;',
      'esac',
      '',
      'curl -Lfo d2.tar.gz "https://github.com/terrastruct/d2/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf d2.tar.gz',
      'install -Dm755 "d2-v${VERSION}/bin/d2" {{prefix}}/bin/d2',
    ],
  },
}
