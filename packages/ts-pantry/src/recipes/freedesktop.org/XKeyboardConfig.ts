import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/XKeyboardConfig',
  name: 'XKeyboardConfig',
  programs: [],
  buildDependencies: {
    'gnu.org/gettext': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'python.org': '~3.11',
    'gnome.org/libxslt': '=1.1.43',
  },
  distributable: {
    url: 'https://xorg.freedesktop.org/archive/individual/data/xkeyboard-config/xkeyboard-config-{{version.marketing}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      MESON_ARGS: [
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'ls {{prefix}}/share/man/man7 | grep "xkeyboard-config.7"',
      'pkg-config --variable=xkb_base xkeyboard-config | grep "share/X11/xkb"',
      'pkg-config --modversion xkeyboard-config | grep {{version.marketing}}',
    ],
  },
}
