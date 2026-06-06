import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gomplate.ca',
  name: 'gomplate',
  description: 'A flexible commandline tool for template rendering. Supports lots of local and remote datasources.',
  homepage: 'https://gomplate.ca/',
  github: 'https://github.com/hairyhenderson/gomplate',
  programs: ['gomplate'],
  versionSource: {
    type: 'github-releases',
    repo: 'hairyhenderson/gomplate',
  },
  // Prebuilt download: gomplate ships official per-platform bare binaries
  // (named gomplate_<os>-<arch>, no archive).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="gomplate_darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="gomplate_darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="gomplate_linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="gomplate_linux-amd64"  ;;',
      'esac',
      '',
      'curl -Lfo gomplate "https://github.com/hairyhenderson/gomplate/releases/download/v${VERSION}/${ASSET}"',
      'install -Dm755 gomplate {{prefix}}/bin/gomplate',
    ],
  },

  test: {
    script: [
      '{{prefix}}/bin/gomplate --version',
    ],
  },
}
