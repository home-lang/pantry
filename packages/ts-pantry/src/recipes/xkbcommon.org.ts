import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xkbcommon.org',
  name: 'xkbcli',
  description: 'keymap handling library for toolkits and window systems',
  homepage: 'https://xkbcommon.org/',
  github: 'https://github.com/xkbcommon/libxkbcommon',
  programs: ['xkbcli'],
  versionSource: {
    type: 'github-releases',
    repo: 'xkbcommon/libxkbcommon',
    tagPattern: /\/^xkbcommon-\//,
  },
  distributable: {
    url: 'https://github.com/xkbcommon/libxkbcommon/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'x.org/x11': '*',
    'x.org/xcb': '*',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },

  build: {
    script: [
      'meson $MESON_ARGS build',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      'MESON_ARGS': ['--prefix="{{prefix}}"', '--libdir="{{prefix}}/lib"', '--buildtype=release', '--wrap-mode=nofallback', '-Denable-wayland=false', '-Denable-docs=false'],
    },
  },
}
