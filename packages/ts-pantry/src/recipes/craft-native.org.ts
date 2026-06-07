import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'craft-native.org',
  name: 'craft',
  description: 'Build desktop apps with web languages, powered by Zig',
  homepage: 'https://craft-native.org',
  github: 'https://github.com/home-lang/craft',
  programs: ['craft'],
  versionSource: {
    type: 'github-releases',
    repo: 'home-lang/craft',
    tagPattern: /^v(.+)$/,
  },

  // craft ships official prebuilt per-platform binaries on its GitHub releases
  // (craft-{os}-{arch}.zip). This is a zig-style download recipe: case on
  // {{hw.platform}}/{{hw.arch}}, curl the official asset, and install `craft`.
  // No linux-arm64 asset is published upstream, so it is omitted below.
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/x86-64'],

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="craft-darwin-arm64.zip" ;;',
      '  darwin+x86-64)  ASSET="craft-darwin-x64.zip"   ;;',
      '  linux+x86-64)   ASSET="craft-linux-x64.zip"    ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'URL="https://github.com/home-lang/craft/releases/download/v${VERSION}/${ASSET}"',
      'curl -Lfo craft.zip "$URL"',
      'unzip -o craft.zip',
      '',
      'install -Dm755 craft {{prefix}}/bin/craft',
    ],
  },
}
