import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'watchexec.github.io',
  name: 'watchexec',
  description: 'Executes commands in response to file modifications',
  homepage: 'https://watchexec.github.io/',
  github: 'https://github.com/watchexec/watchexec',
  programs: ['watchexec'],
  versionSource: {
    type: 'github-releases',
    repo: 'watchexec/watchexec',
  },
  // Prebuilt download: watchexec ships official per-platform release archives
  // (.tar.xz; Rust target triples; binary under watchexec-<version>-<triple>/).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TRIPLE="aarch64-apple-darwin"      ;;',
      '  darwin+x86-64)  TRIPLE="x86_64-apple-darwin"       ;;',
      '  linux+aarch64)  TRIPLE="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TRIPLE="x86_64-unknown-linux-gnu"  ;;',
      'esac',
      'ASSET="watchexec-${VERSION}-${TRIPLE}"',
      '',
      'curl -Lfo watchexec.tar.xz "https://github.com/watchexec/watchexec/releases/download/v${VERSION}/${ASSET}.tar.xz"',
      'tar Jxf watchexec.tar.xz',
      'install -Dm755 "${ASSET}/watchexec" {{prefix}}/bin/watchexec',
    ],
  },
}
