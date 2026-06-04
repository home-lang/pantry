import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/junegunn/fzf',
  name: 'fzf',
  programs: [
    'fzf',
  ],
  // Prebuilt download: fzf ships official per-platform release tarballs
  // (the bare `fzf` binary at the archive root).
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="fzf-${VERSION}-darwin_arm64" ;;',
      '  darwin+x86-64)  ASSET="fzf-${VERSION}-darwin_amd64" ;;',
      '  linux+aarch64)  ASSET="fzf-${VERSION}-linux_arm64"  ;;',
      '  linux+x86-64)   ASSET="fzf-${VERSION}-linux_amd64"  ;;',
      'esac',
      '',
      'curl -Lfo fzf.tar.gz "https://github.com/junegunn/fzf/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf fzf.tar.gz',
      'install -Dm755 fzf {{prefix}}/bin/fzf',
    ],
  },
  test: {
    script: [
      'out=$(printf "hello\\nworld\\n" | fzf -f wld)',
      'test "$out" = "world"',
    ],
  },
}
