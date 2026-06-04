import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'felixkratz.github.io/SketchyBar',
  name: 'SketchyBar',
  // macOS-only: a macOS menu-bar replacement built against Cocoa frameworks
  // (its `make universal` target passes the clang `-target` flag) that depends
  // on yabai, a macOS window manager.
  platforms: ['darwin'],
  programs: [
    'sketchybar',
  ],
  dependencies: {
    'github.com/koekeishiya/yabai': '*',
  },
  distributable: {
    url: 'https://github.com/FelixKratz/SketchyBar/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $ARCH',
      'install -D bin/sketchybar {{prefix}}/bin/sketchybar',
      'install -D sketchybarrc {{prefix}}/etc/sketchybarrc.example',
      {
        run: 'sed -i -e \'s/\\[ \\$PERCENTAGE /[ "$PERCENTAGE" /\' battery.sh',
        'working-directory': 'plugins',
      },
      'cp -a plugins {{prefix}}/etc',
    ],
    env: {
      'darwin/aarch64': {
        ARCH: 'arm64',
      },
      'darwin/x86-64': {
        ARCH: 'x86',
      },
    },
  },
  test: {
    script: [
      'sketchybar --help',
      'test "$(sketchybar --version)" = "sketchybar-v{{version}}"',
    ],
  },
}
