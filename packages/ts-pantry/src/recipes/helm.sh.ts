import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'helm.sh',
  name: 'helm',
  description: 'The Kubernetes Package Manager',
  homepage: 'https://helm.sh/',
  github: 'https://github.com/helm/helm',
  programs: ['helm'],
  versionSource: {
    type: 'github-releases',
    repo: 'helm/helm',
  },
  // Prebuilt download: helm ships official per-platform release tarballs
  // (binary under <os>-<arch>/helm).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="darwin-arm64" ;;',
      '  darwin+x86-64)  PLATFORM="darwin-amd64" ;;',
      '  linux+aarch64)  PLATFORM="linux-arm64"  ;;',
      '  linux+x86-64)   PLATFORM="linux-amd64"  ;;',
      'esac',
      '',
      'curl -Lfo helm.tar.gz "https://get.helm.sh/helm-v${VERSION}-${PLATFORM}.tar.gz"',
      'tar xf helm.tar.gz',
      'install -Dm755 "${PLATFORM}/helm" {{prefix}}/bin/helm',
    ],
  },
}
