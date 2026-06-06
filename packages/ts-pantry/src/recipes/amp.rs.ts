import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'amp.rs',
  name: 'amp',
  description: 'A complete text editor for your terminal.',
  homepage: 'https://amp.rs',
  github: 'https://github.com/jmacdonald/amp',
  programs: ['amp'],
  platforms: ['darwin/aarch64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'jmacdonald/amp',
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET=amp-aarch64-apple-darwin ;;',
      '  linux+x86-64) ASSET=amp-x86_64-unknown-linux-musl ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}} (upstream ships darwin/aarch64 and linux/x86-64 only)" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo amp "https://github.com/jmacdonald/amp/releases/download/{{version.raw}}/$ASSET"',
      'mkdir -p {{prefix}}/bin',
      'install -m755 amp {{prefix}}/bin/amp',
    ],
  },
  test: {
    script: [
      'test -s {{prefix}}/bin/amp',
      'test -x {{prefix}}/bin/amp',
    ],
  },
}
