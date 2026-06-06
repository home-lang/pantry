import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/termusic',
  name: 'termusic',
  programs: [
    'termusic',
    'termusic-server',
  ],
  dependencies: {
    linux: {
      'alsa-project.org/alsa-lib': '*',
      'freedesktop.org/dbus': '*',
    },
  },
  versionSource: {
    type: 'github-releases',
    repo: 'tramhao/termusic',
  },
  // Prebuilt download: termusic (Rust) ships official per-platform release
  // tarballs (`termusic-v<ver>-<target>.tar.xz`) containing the `termusic` and
  // `termusic-server` binaries. No build-time customization in our recipe, so
  // the official prebuilt is identical to a source build.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-macos"  ;;',
      '  darwin+x86-64)  TARGET="x86_64-macos"   ;;',
      '  linux+aarch64)  TARGET="aarch64-linux"  ;;',
      '  linux+x86-64)   TARGET="x86_64-linux"   ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -Lfo termusic.tar.xz "https://github.com/tramhao/termusic/releases/download/v${VERSION}/termusic-v${VERSION}-${TARGET}.tar.xz"',
      'tar xJf termusic.tar.xz',
      'install -Dm755 "termusic-v${VERSION}-${TARGET}/termusic" {{prefix}}/bin/termusic',
      'install -Dm755 "termusic-v${VERSION}-${TARGET}/termusic-server" {{prefix}}/bin/termusic-server',
    ],
  },

  test: {
    script: [
      'termusic --version | grep {{version}}',
      'termusic-server --version | grep {{version}}',
    ],
  },
}
