import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'k9scli.io',
  name: 'k9s',
  description: '🐶 Kubernetes CLI To Manage Your Clusters In Style!',
  homepage: 'https://k9scli.io/',
  github: 'https://github.com/derailed/k9s',
  programs: ['k9s'],
  versionSource: {
    type: 'github-releases',
    repo: 'derailed/k9s',
  },
  // Prebuilt download: k9s ships official per-platform release tarballs
  // (capitalized OS in the asset name; bare `k9s` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="k9s_Darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="k9s_Darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="k9s_Linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="k9s_Linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo k9s.tar.gz "https://github.com/derailed/k9s/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf k9s.tar.gz',
      'install -Dm755 k9s {{prefix}}/bin/k9s',
    ],
  },
}
