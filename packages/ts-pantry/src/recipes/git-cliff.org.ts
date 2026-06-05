import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-cliff.org',
  name: 'git-cliff',
  description: 'A highly customizable Changelog Generator that follows Conventional Commit specifications ⛰️ ',
  homepage: 'https://git-cliff.org',
  github: 'https://github.com/orhun/git-cliff',
  programs: ['git-cliff'],
  versionSource: {
    type: 'github-releases',
    repo: 'orhun/git-cliff',
    tagPattern: /^v(.+)$/,
  },
  // Prebuilt download: git-cliff ships official per-platform release tarballs
  // (Rust target triples; binary under git-cliff-<version>/git-cliff).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="git-cliff-${VERSION}-aarch64-apple-darwin"      ;;',
      '  darwin+x86-64)  ASSET="git-cliff-${VERSION}-x86_64-apple-darwin"       ;;',
      '  linux+aarch64)  ASSET="git-cliff-${VERSION}-aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   ASSET="git-cliff-${VERSION}-x86_64-unknown-linux-gnu"  ;;',
      'esac',
      '',
      'curl -Lfo git-cliff.tar.gz "https://github.com/orhun/git-cliff/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf git-cliff.tar.gz',
      'install -Dm755 "git-cliff-${VERSION}/git-cliff" {{prefix}}/bin/git-cliff',
    ],
  },

  test: {
    script: [
      'test "$(git-cliff --version)" = "git-cliff {{version}}"',
    ],
  },
}
