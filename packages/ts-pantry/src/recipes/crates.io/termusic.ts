import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/termusic",
  name: "termusic",
  programs: [
    "termusic",
    "termusic-server",
  ],
  dependencies: {
    linux: {
      'alsa-project.org/alsa-lib': "*",
      'freedesktop.org/dbus': "*",
    },
  },
  buildDependencies: {
    'rust-lang.org': ">=1.75",
    'rust-lang.org/cargo': "*",
    'protobuf.dev': "*",
    'abseil.io': "^20250127",
  },
  distributable: {
    url: "https://github.com/tramhao/termusic/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "rm {tui,server}/build.rs",
      "cargo build --release --all",
      {
        run: "mkdir -p {{prefix}}/bin\ninstall termusic {{prefix}}/bin/\ninstall termusic-server {{prefix}}/bin/",
        'working-directory': "target/release",
      },
    ],
    env: {
      TERMUSIC_VERSION: "v{{version}}[pkgx]",
    },
  },
  test: {
    script: [
      "termusic --version | grep {{version}}",
      "termusic-server --version | grep {{version}}",
      "termusic import $FIXTURE > out",
      "grep 'Importing 1 podcasts...' out",
      "grep 'Added Revolutions' out",
      "grep 'Import successful.' out",
    ],
  },
}
