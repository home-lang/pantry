import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'argoproj.github.io/cd',
  name: 'cd',
  programs: [
    'argocd',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'argoproj/argo-cd',
  },
  // Prebuilt download: Argo CD ships an official per-platform `argocd-<os>-<arch>`
  // single binary on its GitHub releases. The CLI is a pure Go build with no
  // configuration we customize (the source build only ever ran `make cli-local`),
  // so the official binary is identical to what we'd compile.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="linux-amd64"  ;;',
      'esac',
      '',
      'curl -Lfo argocd "https://github.com/argoproj/argo-cd/releases/download/v${VERSION}/argocd-${ASSET}"',
      'install -Dm755 argocd {{prefix}}/bin/argocd',
    ],
  },

  test: {
    script: [
      'argocd version --client | grep {{version}}',
    ],
  },
}
