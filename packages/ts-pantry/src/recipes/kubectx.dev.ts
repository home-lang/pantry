import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubectx.dev',
  name: 'kube',
  description: 'Tool that can switch between kubectl contexts easily and create aliases',
  homepage: 'https://kubectx.dev',
  github: 'https://github.com/ahmetb/kubectx',
  programs: ['kubectx', 'kubens'],
  versionSource: {
    type: 'github-releases',
    repo: 'ahmetb/kubectx',
  },
  dependencies: {
    'github.com/junegunn/fzf': '*',
  },
  // Prebuilt download: kubectx ships official per-platform release tarballs for
  // each binary (kubectx_v<ver>_<os>_<arch>.tar.gz, kubens_v<ver>_...).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) SUFFIX="darwin_arm64"  ;;',
      '  darwin+x86-64)  SUFFIX="darwin_x86_64" ;;',
      '  linux+aarch64)  SUFFIX="linux_arm64"   ;;',
      '  linux+x86-64)   SUFFIX="linux_x86_64"  ;;',
      'esac',
      '',
      'curl -Lfo kubectx.tar.gz "https://github.com/ahmetb/kubectx/releases/download/v${VERSION}/kubectx_v${VERSION}_${SUFFIX}.tar.gz"',
      'curl -Lfo kubens.tar.gz "https://github.com/ahmetb/kubectx/releases/download/v${VERSION}/kubens_v${VERSION}_${SUFFIX}.tar.gz"',
      'tar xf kubectx.tar.gz',
      'tar xf kubens.tar.gz',
      'install -Dm755 kubectx {{prefix}}/bin/kubectx',
      'install -Dm755 kubens {{prefix}}/bin/kubens',
    ],
  },
}
