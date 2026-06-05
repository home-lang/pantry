import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/code-cli',
  name: 'code-cli',
  programs: [
    'code',
  ],
  // Prebuilt download: Microsoft publishes the standalone VS Code `code` CLI as
  // per-platform, per-version archives through the update service at
  // `https://update.code.visualstudio.com/<version>/cli-<os>-<arch>/stable`.
  // darwin archives are a zip, linux archives are a tar.gz; both contain a single
  // bare `code` binary. Maps darwin x64/arm64 + linux x64/arm64. This is the
  // official signed CLI — no source build needed.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="cli-darwin-arm64"; FMT=zip ;;',
      '  darwin+x86-64)  PLATFORM="cli-darwin-x64";   FMT=zip ;;',
      '  linux+aarch64)  PLATFORM="cli-linux-arm64";  FMT=tgz ;;',
      '  linux+x86-64)   PLATFORM="cli-linux-x64";    FMT=tgz ;;',
      'esac',
      '',
      'URL="https://update.code.visualstudio.com/${VERSION}/${PLATFORM}/stable"',
      'mkdir -p {{prefix}}/bin',
      'if [ "$FMT" = zip ]; then',
      '  curl -Lfo code.zip "$URL"',
      '  unzip -o code.zip',
      'else',
      '  curl -Lfo code.tgz "$URL"',
      '  tar zxf code.tgz',
      'fi',
      'install -Dm755 code {{prefix}}/bin/code',
    ],
  },
  test: {
    script: [
      'code --version | grep {{version}}',
      'code tunnel prune | grep \'Successfully removed all unused servers\'',
    ],
  },
}
