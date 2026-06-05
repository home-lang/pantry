import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'infracost.io',
  name: 'infracost',
  description: 'Cloud cost estimates for Terraform in pull requests💰📉 Shift FinOps Left!',
  homepage: 'https://www.infracost.io/docs/',
  github: 'https://github.com/infracost/infracost',
  programs: ['infracost'],
  versionSource: {
    type: 'github-releases',
    repo: 'infracost/infracost',
  },
  // Prebuilt download: infracost ships official per-platform release tarballs
  // (binary named infracost-<os>-<arch> inside the archive).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="infracost-darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="infracost-darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="infracost-linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="infracost-linux-amd64"  ;;',
      'esac',
      '',
      'curl -Lfo infracost.tar.gz "https://github.com/infracost/infracost/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf infracost.tar.gz',
      'install -Dm755 "${ASSET}" {{prefix}}/bin/infracost',
    ],
  },
}
