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
    'rust-lang.org': ">=1.60",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/aome510/spotify-player/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "sed -i '1,10s/^version = \".*\"/version = \{{version}}\/' spotify_player/Cargo.toml",
      "cargo install $ARGS",
      {
        run: "SIXEL=$(otool -l {{prefix}}/bin/spotify_player | grep 'libsixel.1.dylib' | sed 's/.*name \\(.*\\) (offset .*/\\1/')\ninstall_name_tool -change \"$SIXEL\" {{deps.github.com/libsixel/libsixel.prefix}}/lib/libsixel.1.dylib {{prefix}}/bin/spotify_player",
        if: "darwin",
      },
    ],
    env: {
      ARGS: [
        "--locked",
        "--path spotify_player",
        "--root {{prefix}}",
        "--features sixel,notify,fzf",
      ],
    },
  },
}
