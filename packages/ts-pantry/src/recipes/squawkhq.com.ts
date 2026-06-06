import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'squawkhq.com',
  name: 'squawk',
  description: '🐘 linter for PostgreSQL, focused on migrations',
  homepage: 'https://squawkhq.com',
  github: 'https://github.com/sbdchd/squawk',
  programs: ['squawk'],
  versionSource: {
    type: 'github-releases',
    repo: 'sbdchd/squawk',
  },
  // Prebuilt download: squawk ships official per-platform bare binaries
  // (named squawk-<os>-<arch>, no archive).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="squawk-darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="squawk-darwin-x64"   ;;',
      '  linux+aarch64)  ASSET="squawk-linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="squawk-linux-x64"    ;;',
      'esac',
      '',
      'curl -Lfo squawk "https://github.com/sbdchd/squawk/releases/download/v${VERSION}/${ASSET}"',
      'install -Dm755 squawk {{prefix}}/bin/squawk',
    ],
  },

  test: {
    script: [
      'squawk --version',
    ],
  },
}
