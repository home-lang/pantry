import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/gdk-pixbuf',
  name: 'gdk-pixbuf',
  programs: [
    'gdk-pixbuf-csource',
    'gdk-pixbuf-pixdata',
    'gdk-pixbuf-query-loaders',
  ],
  dependencies: {
    'ijg.org': 9.6,
    'gnome.org/glib': 2,
    'libpng.org': 1,
    'freedesktop.org/shared-mime-info': 2,
  },
  buildDependencies: {
    'mesonbuild.com': 1,
    'ninja-build.org': 1,
    'freedesktop.org/pkg-config': '^0.29',
    'gnome.org/gobject-introspection': 1,
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gdk-pixbuf/{{version.major}}.{{version.minor}}/gdk-pixbuf-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: 'export XDG_DATA_DIRS="$XDG_DATA_DIRS:/usr/share"',
        if: 'linux',
      },
      'meson setup $MESON_ARGS ..',
      'ninja',
      'ninja install',
    ],
    env: {
      MESON_ARGS: [
        '--buildtype=release',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '-Dman=false',
        '-Ddocumentation=false',
        '-Dglycin=disabled',
        '-Dthumbnailer=disabled',
      ],
    },
  },
  test: {
    script: [
      'cc test.c $CFLAGS $LDFLAGS',
      './a.out',
    ],
  },
}
