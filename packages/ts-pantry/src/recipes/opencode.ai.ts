import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opencode.ai',
  name: 'opencode.ai',
  description: 'The open source coding agent.',
  homepage: 'https://opencode.ai',
  github: 'https://github.com/anomalyco/opencode',
  programs: ['opencode'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64', 'linux/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'anomalyco/opencode',
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET=opencode-darwin-arm64.zip ;;',
      '  darwin+x86-64) ASSET=opencode-darwin-x64.zip ;;',
      '  linux+x86-64) ASSET=opencode-linux-x64-musl.tar.gz ;;',
      '  linux+aarch64) ASSET=opencode-linux-arm64-musl.tar.gz ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ASSET" "https://github.com/anomalyco/opencode/releases/download/v{{version}}/$ASSET"',
      'case "$ASSET" in',
      '  *.zip) unzip -q "$ASSET" ;;',
      '  *.tar.gz) tar -xzf "$ASSET" ;;',
      'esac',
      'mkdir -p {{prefix}}/bin',
      'install -m755 opencode {{prefix}}/bin/opencode',
    ],
  },
  test: {
    script: [
      'test -s {{prefix}}/bin/opencode',
      'test -x {{prefix}}/bin/opencode',
    ],
  },
}
