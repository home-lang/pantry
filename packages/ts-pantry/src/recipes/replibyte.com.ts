import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'replibyte.com',
  name: 'replibyte',
  description: 'Seed your development database with real data ⚡️',
  homepage: 'https://www.replibyte.com',
  github: 'https://github.com/Qovery/Replibyte',
  programs: ['replibyte'],
  platforms: ['darwin/x86-64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'Qovery/Replibyte',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64) ASSET=replibyte_v{{version}}_x86_64-apple-darwin.zip ;;',
      '  linux+x86-64) ASSET=replibyte_v{{version}}_x86_64-unknown-linux-musl.tar.gz ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}} (upstream ships darwin/x86-64 and linux/x86-64 only)" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo "$ASSET" "https://github.com/Qovery/Replibyte/releases/download/v{{version}}/$ASSET"',
      'case "$ASSET" in',
      '  *.zip) unzip -q "$ASSET" ;;',
      '  *.tar.gz) tar -xzf "$ASSET" ;;',
      'esac',
      'mkdir -p {{prefix}}/bin',
      'install -m755 replibyte {{prefix}}/bin/replibyte',
    ],
  },
  test: {
    script: [
      'test -s {{prefix}}/bin/replibyte',
      'test -x {{prefix}}/bin/replibyte',
    ],
  },
}
