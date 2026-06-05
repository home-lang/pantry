import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'changie.dev',
  name: 'changie',
  description: 'Automated changelog tool for preparing releases with lots of customization options',
  homepage: 'https://changie.dev/',
  github: 'https://github.com/miniscruff/changie',
  programs: ['changie'],
  versionSource: {
    type: 'github-releases',
    repo: 'miniscruff/changie',
  },
  // Prebuilt download: changie ships official per-platform release tarballs
  // (bare `changie` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="changie_${VERSION}_darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="changie_${VERSION}_darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="changie_${VERSION}_linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="changie_${VERSION}_linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo changie.tar.gz "https://github.com/miniscruff/changie/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf changie.tar.gz',
      'install -Dm755 changie {{prefix}}/bin/changie',
    ],
  },
}
