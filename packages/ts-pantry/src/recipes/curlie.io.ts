import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'curlie.io',
  name: 'curlie',
  description: 'The power of curl, the ease of use of httpie.',
  homepage: 'https://rs.github.io/curlie',
  github: 'https://github.com/rs/curlie',
  programs: ['curlie'],
  versionSource: {
    type: 'github-releases',
    repo: 'rs/curlie',
  },
  // Prebuilt download: curlie ships official per-platform release tarballs
  // (bare `curlie` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="curlie_${VERSION}_darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="curlie_${VERSION}_darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="curlie_${VERSION}_linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="curlie_${VERSION}_linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo curlie.tar.gz "https://github.com/rs/curlie/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf curlie.tar.gz',
      'install -Dm755 curlie {{prefix}}/bin/curlie',
    ],
  },
}
