import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dotenv-linter.github.io',
  name: 'dotenv-linter',
  description: '⚡️Lightning-fast linter for .env files. Written in Rust 🦀',
  homepage: 'https://dotenv-linter.github.io',
  github: 'https://github.com/dotenv-linter/dotenv-linter',
  programs: ['dotenv-linter'],
  versionSource: {
    type: 'github-releases',
    repo: 'dotenv-linter/dotenv-linter',
    tagPattern: /^v(.+)$/,
  },
  // Prebuilt download: dotenv-linter ships official per-platform release
  // tarballs (bare `dotenv-linter` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="dotenv-linter-darwin-arm64"   ;;',
      '  darwin+x86-64)  ASSET="dotenv-linter-darwin-x86_64"  ;;',
      '  linux+aarch64)  ASSET="dotenv-linter-linux-aarch64"  ;;',
      '  linux+x86-64)   ASSET="dotenv-linter-linux-x86_64"   ;;',
      'esac',
      '',
      'curl -Lfo dotenv-linter.tar.gz "https://github.com/dotenv-linter/dotenv-linter/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf dotenv-linter.tar.gz',
      'install -Dm755 dotenv-linter {{prefix}}/bin/dotenv-linter',
    ],
  },
}
