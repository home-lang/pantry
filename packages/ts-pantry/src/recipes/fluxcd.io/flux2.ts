import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fluxcd.io/flux2',
  name: 'flux2',
  programs: [
    'flux',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'fluxcd/flux2',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="flux_${VERSION}_darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="flux_${VERSION}_darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="flux_${VERSION}_linux_arm64" ;;',
      '  linux+x86-64)   ASSET="flux_${VERSION}_linux_amd64" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo flux.tar.gz "https://github.com/fluxcd/flux2/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf flux.tar.gz',
      'mkdir -p {{ prefix }}/bin',
      'install -m755 flux {{ prefix }}/bin/flux',
    ],
  },
  test: {
    script: [
      'test "$(flux --version)" = "flux version {{version}}"',
      'flux install --export > flux-system.yml',
      'test -f flux-system.yml',
    ],
  },
}
