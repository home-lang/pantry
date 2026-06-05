import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'just.systems',
  name: 'just',
  description: 'Handy way to save and run project-specific commands',
  homepage: 'https://just.systems',
  github: 'https://github.com/casey/just',
  programs: ['just'],
  versionSource: {
    type: 'github-releases',
    repo: 'casey/just',
    tagPattern: /^v?(.+)$/,
  },
  // Prebuilt download: just ships official per-platform release tarballs
  // (Rust target triples; bare `just` binary at the archive root). Linux ships
  // statically-linked musl builds (run on glibc too). Tags have no `v` prefix.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="just-${VERSION}-aarch64-apple-darwin"        ;;',
      '  darwin+x86-64)  ASSET="just-${VERSION}-x86_64-apple-darwin"         ;;',
      '  linux+aarch64)  ASSET="just-${VERSION}-aarch64-unknown-linux-musl"  ;;',
      '  linux+x86-64)   ASSET="just-${VERSION}-x86_64-unknown-linux-musl"   ;;',
      'esac',
      '',
      'curl -Lfo just.tar.gz "https://github.com/casey/just/releases/download/${VERSION}/${ASSET}.tar.gz"',
      'tar xf just.tar.gz',
      'install -Dm755 just {{prefix}}/bin/just',
    ],
  },
}
