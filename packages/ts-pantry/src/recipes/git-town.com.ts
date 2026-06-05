import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-town.com',
  name: 'git-town',
  description: 'High-level command-line interface for Git',
  homepage: 'https://www.git-town.com/',
  github: 'https://github.com/git-town/git-town',
  programs: ['git-town'],
  versionSource: {
    type: 'github-releases',
    repo: 'git-town/git-town',
    tagPattern: /^v(.+)$/,
  },
  // Prebuilt download: git-town ships official per-platform release tarballs
  // (bare `git-town` binary at the archive root; intel/arm arch tokens).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="git-town_macos_arm_64"   ;;',
      '  darwin+x86-64)  ASSET="git-town_macos_intel_64" ;;',
      '  linux+aarch64)  ASSET="git-town_linux_arm_64"   ;;',
      '  linux+x86-64)   ASSET="git-town_linux_intel_64" ;;',
      'esac',
      '',
      'curl -Lfo git-town.tar.gz "https://github.com/git-town/git-town/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf git-town.tar.gz',
      'install -Dm755 git-town {{prefix}}/bin/git-town',
    ],
  },
}
