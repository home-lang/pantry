import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'argoproj.github.io/workflows',
  name: 'workflows',
  programs: [
    'argo',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'argoproj/argo-workflows',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="argo-darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="argo-darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="argo-linux-arm64" ;;',
      '  linux+x86-64)   ASSET="argo-linux-amd64" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo argo.gz "https://github.com/argoproj/argo-workflows/releases/download/v${VERSION}/${ASSET}.gz"',
      'gzip -dc argo.gz > argo',
      'mkdir -p {{prefix}}/bin',
      'install -m755 argo {{prefix}}/bin/argo',
    ],
  },
  test: {
    script: [
      'argo version | grep "v{{version}}"',
    ],
  },
}
