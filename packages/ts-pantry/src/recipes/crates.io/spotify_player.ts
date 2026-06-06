import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/spotify_player",
  name: "spotify_player",
  programs: [
    "spotify_player",
  ],
  dependencies: {
    'openssl.org': "^1.1",
    'github.com/libsixel/libsixel': "^1",
    linux: {
      'alsa-project.org/alsa-lib': "^1",
      'freedesktop.org/dbus': "^1",
    },
  },
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: null,
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) TARGET="aarch64-apple-darwin" ;;',
      '  darwin+x86-64)  TARGET="x86_64-apple-darwin" ;;',
      '  linux+aarch64)  TARGET="aarch64-unknown-linux-gnu" ;;',
      '  linux+x86-64)   TARGET="x86_64-unknown-linux-gnu" ;;',
      '  *) echo "unsupported platform {{hw.platform}}/{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      'curl -Lfo spotify_player.tar.gz "https://github.com/aome510/spotify-player/releases/download/v${VERSION}/spotify_player-${TARGET}.tar.gz"',
      'tar xzf spotify_player.tar.gz',
      'install -Dm755 spotify_player {{prefix}}/bin/spotify_player',
    ],
    skip: ['fix-machos'],
  },
  test: {
    script: [
      '{{prefix}}/bin/spotify_player --version > out',
      'grep {{version}} out',
    ],
  },
}
