import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cli.github.com',
  name: 'gh',
  description: 'GitHub’s official command line tool',
  homepage: 'https://cli.github.com/',
  github: 'https://github.com/cli/cli',
  programs: ['gh'],
  versionSource: {
    type: 'github-releases',
    repo: 'cli/cli',
  },
  // Prebuilt download: gh ships official per-platform release archives.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="gh_${VERSION}_macOS_arm64";  EXT="zip"    ;;',
      '  darwin+x86-64)  ASSET="gh_${VERSION}_macOS_amd64";  EXT="zip"    ;;',
      '  linux+aarch64)  ASSET="gh_${VERSION}_linux_arm64";  EXT="tar.gz" ;;',
      '  linux+x86-64)   ASSET="gh_${VERSION}_linux_amd64";  EXT="tar.gz" ;;',
      'esac',
      '',
      'URL="https://github.com/cli/cli/releases/download/v${VERSION}/${ASSET}.${EXT}"',
      'curl -Lfo "gh.${EXT}" "$URL"',
      'if test "$EXT" = "zip"; then unzip -q "gh.${EXT}"; else tar xf "gh.${EXT}"; fi',
      '',
      '# The archive contains <asset>/bin/gh',
      'install -Dm755 "${ASSET}/bin/gh" {{prefix}}/bin/gh',
    ],
  },
}
