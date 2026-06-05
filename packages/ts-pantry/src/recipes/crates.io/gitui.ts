import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/gitui',
  name: 'gitui',
  programs: [
    'gitui',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'gitui-org/gitui',
    tagPattern: /^v(.+)$/,
  },
  // gitui ships official prebuilt per-platform binaries on its GitHub releases
  // (gitui-mac.tar.gz / gitui-mac-x86.tar.gz / gitui-linux-x86_64.tar.gz /
  // gitui-linux-aarch64.tar.gz), each a single `gitui` binary — so we download
  // the upstream release asset instead of compiling from source. The repo was
  // renamed extrawurst/gitui -> gitui-org/gitui; GitHub redirects old release
  // asset URLs, so older tags resolve too.
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="gitui-mac.tar.gz" ;;',
      '  darwin+x86-64)  ASSET="gitui-mac-x86.tar.gz" ;;',
      '  linux+aarch64)  ASSET="gitui-linux-aarch64.tar.gz" ;;',
      '  linux+x86-64)   ASSET="gitui-linux-x86_64.tar.gz" ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/gitui-org/gitui/releases/download/v${VERSION}/${ASSET}"',
      'curl -Lfo gitui.tar.gz "$URL"',
      'tar zxf gitui.tar.gz',
      '',
      '# tarballs ship the binary at ./gitui',
      'install -Dm755 gitui {{prefix}}/bin/gitui',
    ],
  },
  test: {
    script: ['{{prefix}}/bin/gitui --version'],
  },
}
