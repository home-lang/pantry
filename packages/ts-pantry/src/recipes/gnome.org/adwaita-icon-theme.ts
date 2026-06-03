import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/adwaita-icon-theme',
  name: 'adwaita-icon-theme',
  programs: [],
  buildDependencies: {
    'gnu.org/gettext': '*',
    'gtk.org/gtk4': '*',
    'freedesktop.org/intltool': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/adwaita-icon-theme/{{version.major}}/adwaita-icon-theme-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'ls {{prefix}}/share/icons/Adwaita/16x16/devices | grep \'audio-headphones.png\'',
      'ls {{prefix}}/share/icons/Adwaita | grep \'index.theme\'',
      'pkg-config --modversion adwaita-icon-theme | grep {{version.raw}}',
    ],
  },
}
