import type { Recipe } from '../../scripts/recipe-types'

// rome.tools is an archived/deprecated tool (succeeded by Biome). Its CLI
// releases (tagged `cli/v<version>`) ship official prebuilt binaries named
// `rome-<os>-<arch>` from v11.0.0 onward. Download the official binary instead
// of compiling the rome_cli crate from source. (The ancient v0.4.2 predates both
// the cli/v tag scheme and prebuilt assets, so it is not buildable.)
export const recipe: Recipe = {
  domain: 'rome.tools',
  name: 'rome',
  description: 'Unified developer tools for JavaScript, TypeScript, and the web',
  homepage: 'https://docs.rome.tools/',
  github: 'https://github.com/rome/tools',
  programs: ['rome'],
  versionSource: {
    type: 'github-releases',
    repo: 'rome/tools',
    // Rome's CLI releases are tagged `cli/v12.1.3` (the repo also carries
    // `lsp/v*`, `js-api/v*` and `*-nightly`/`*-next` prerelease tags).
    tagPattern: /^cli\/v(.+)$/,
  },
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="rome-darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="rome-darwin-x64" ;;',
      '  linux+aarch64)  ASSET="rome-linux-arm64" ;;',
      '  linux+x86-64)   ASSET="rome-linux-x64" ;;',
      'esac',
      '',
      'URL="https://github.com/rome/tools/releases/download/cli/v${VERSION}/${ASSET}"',
      'curl -Lfo rome "$URL"',
      'install -Dm755 rome {{prefix}}/bin/rome',
    ],
  },
  test: {
    script: [
      'rome --version',
    ],
  },
}
