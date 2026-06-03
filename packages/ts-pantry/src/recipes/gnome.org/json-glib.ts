import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/json-glib',
  name: 'json-glib',
  programs: [],
  dependencies: {
    'gnome.org/glib': '^2.78',
  },
  buildDependencies: {
    'gnu.org/gettext': '*',
    'gnome.org/gobject-introspection': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/json-glib/{{version.marketing}}/json-glib-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/guint fchar/;guint fchar/\' json-scanner.c',
        if: 'darwin',
        'working-directory': 'json-glib',
      },
      {
        run: 'MESON_ARGS="$MESON_ARGS -Ddocumentation=disabled"',
        if: '>=1.9.2',
      },
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
      {
        run: 'ln -s json-glib-1.0/json-glib json-glib',
        'working-directory': '{{prefix}}/include',
      },
    ],
    env: {
      MESON_ARGS: [
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dintrospection=enabled',
        '-Dman=false',
      ],
    },
  },
  test: {
    script: [
      'cc test.c $ARGS -o test',
      './test',
    ],
  },
}
