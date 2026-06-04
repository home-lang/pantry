import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'goreleaser.com',
  name: 'goreleaser',
  description: 'Deliver Go binaries as fast and easily as possible',
  homepage: 'https://goreleaser.com/',
  github: 'https://github.com/goreleaser/goreleaser',
  programs: ['goreleaser'],
  versionSource: {
    type: 'github-releases',
    repo: 'goreleaser/goreleaser',
  },
  // Prebuilt download: goreleaser ships official per-platform release tarballs
  // (capitalized OS + x86_64 for amd64; bare binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="goreleaser_Darwin_arm64"  ;;',
      '  darwin+x86-64)  ASSET="goreleaser_Darwin_x86_64" ;;',
      '  linux+aarch64)  ASSET="goreleaser_Linux_arm64"   ;;',
      '  linux+x86-64)   ASSET="goreleaser_Linux_x86_64"  ;;',
      'esac',
      '',
      'curl -Lfo goreleaser.tar.gz "https://github.com/goreleaser/goreleaser/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf goreleaser.tar.gz',
      'install -Dm755 goreleaser {{prefix}}/bin/goreleaser',
    ],
  },
}
