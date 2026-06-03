import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/gtk-mac-integration-gtk3',
  name: 'gtk-mac-integration-gtk3',
  programs: [],
  dependencies: {
    'gnu.org/gettext': '*',
    'gtk.org/gtk3': '*',
  },
  buildDependencies: {
    'gnome.org/gobject-introspection': '*',
    'freedesktop.org/intltool': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gtk-mac-integration/{{version.marketing}}/gtk-mac-integration-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--without-gtk2',
        '--with-gtk3',
        '--enable-introspection=yes',
        '--enable-python=no',
      ],
    },
  },
  test: {
    script: [
      'cc -o test $FIXTURE $(pkg-config --cflags --libs gtk-mac-integration-gtk3)',
      './test',
    ],
  },
}
