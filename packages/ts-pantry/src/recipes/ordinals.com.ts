import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ordinals.com',
  name: 'ord',
  description: 'Index, block explorer, and command-line wallet',
  homepage: 'https://ordinals.com/',
  github: 'https://github.com/ordinals/ord',
  programs: ['ord'],
  platforms: ['darwin/aarch64', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'casey/ord',
  },

  build: {
    script: [
      'OS=$(uname -s)',
      'ARCH=$(uname -m)',
      'case "$OS/$ARCH" in',
      '  Darwin/arm64) SUFFIX="aarch64-apple-darwin" ;;',
      '  Linux/x86_64) SUFFIX="x86_64-unknown-linux-gnu" ;;',
      '  *) echo "Unsupported: $OS/$ARCH" && exit 1 ;;',
      'esac',
      'mkdir -p "{{prefix}}/bin" /tmp/ord-extract',
      'curl -fSL "https://github.com/ordinals/ord/releases/download/{{version}}/ord-{{version}}-${SUFFIX}.tar.gz" | tar xz -C /tmp/ord-extract',
      'cp "$(find /tmp/ord-extract -name ord -type f | head -1)" "{{prefix}}/bin/ord"',
      'chmod +x "{{prefix}}/bin/ord"',
    ],
  },
}
