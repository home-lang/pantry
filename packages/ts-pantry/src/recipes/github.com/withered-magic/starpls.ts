import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/withered-magic/starpls',
  name: 'starpls',
  programs: [
    'starpls',
  ],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64', 'linux/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'withered-magic/starpls',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,
  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET=starpls-darwin-arm64.tar.gz ;;',
      '  darwin+x86-64) ASSET=starpls-darwin-amd64.tar.gz ;;',
      '  linux+x86-64) ASSET=starpls-linux-amd64.tar.gz ;;',
      '  linux+aarch64) ASSET=starpls-linux-aarch64.tar.gz ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ASSET" "https://github.com/withered-magic/starpls/releases/download/v{{version}}/$ASSET"',
      'tar -xzf "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 starpls {{prefix}}/bin/starpls',
    ],
  },
  test: {
    script: [
      'starpls version | grep {{version}}',
      'starpls --help | grep "Usage: starpls"',
    ],
  },
}
