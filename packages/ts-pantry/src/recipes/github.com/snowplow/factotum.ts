import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/snowplow/factotum',
  name: 'factotum',
  programs: [
    'factotum',
  ],
  dependencies: {
    'openssl.org': '^3',
  },
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64', 'linux/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'snowplow/factotum',
  },
  distributable: null,
  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET=factotum_{{version}}_darwin_arm64.zip ;;',
      '  darwin+x86-64) ASSET=factotum_{{version}}_darwin_x86_64.zip ;;',
      '  linux+x86-64) ASSET=factotum_{{version}}_linux_x86_64.zip ;;',
      '  linux+aarch64) ASSET=factotum_{{version}}_linux_arm64.zip ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ASSET" "https://github.com/snowplow/factotum/releases/download/{{version}}/$ASSET"',
      'unzip -q "$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 factotum {{prefix}}/bin/factotum',
    ],
  },
  test: {
    script: [
      'test "$(factotum --version)" = "Factotum version {{version}}"',
    ],
  },
}
