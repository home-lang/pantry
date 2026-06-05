import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openbao.org/openbao',
  name: 'openbao',
  programs: [
    'bao',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'openbao/openbao',
    tagPattern: /^v(.+)$/,
  },
  // OpenBao (the Vault fork) ships official prebuilt per-platform release
  // archives on GitHub (bao_<ver>_<OS>_<arch>.tar.gz, e.g.
  // bao_2.5.4_Darwin_arm64.tar.gz / bao_2.5.4_Linux_x86_64.tar.gz), each a
  // single static `bao` binary — so we download the upstream asset instead of
  // compiling from source. Asset OS is capitalized (Darwin/Linux) and arch is
  // x86_64/arm64.
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="bao_${VERSION}_Darwin_arm64.tar.gz" ;;',
      '  darwin+x86-64)  ASSET="bao_${VERSION}_Darwin_x86_64.tar.gz" ;;',
      '  linux+aarch64)  ASSET="bao_${VERSION}_Linux_arm64.tar.gz" ;;',
      '  linux+x86-64)   ASSET="bao_${VERSION}_Linux_x86_64.tar.gz" ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/openbao/openbao/releases/download/v${VERSION}/${ASSET}"',
      'curl -Lfo bao.tar.gz "$URL"',
      'tar zxf bao.tar.gz',
      '',
      '# tarballs ship the binary at ./bao alongside LICENSE/README/CHANGELOG',
      'install -Dm755 bao {{prefix}}/bin/bao',
    ],
  },
  test: {
    script: ['{{prefix}}/bin/bao version'],
  },
}
