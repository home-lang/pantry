import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libsoup.org',
  name: 'libsoup',
  programs: [],
  distributable: {
    url: 'https://download.gnome.org/sources/libsoup/{{version.marketing}}/libsoup-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/glib-networking': '*',
    'gnutls.org': '*',
    'rockdaboot.github.io/libpsl': '*',
    'kerberos.org': '*',
    'gnome.org/libxml2': '*',
    'sqlite.org': '*',
    'nghttp2.org': '*',
    linux: {
      'gnu.org/gettext': '*',
      'gnome.org/glib': '*',
      'github.com/google/brotli': '*',
    },
  },
  buildDependencies: {
    'gnome.org/gobject-introspection': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'python.org': '~3.11',
    'gnome.org/vala': '*',
  },

  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
      {
        run: [
          'DIRS=$(find . -mindepth 1 -maxdepth 1 -type d -name libsoup\\*)',
          'for d in $DIRS; do',
          '  d2=$(echo $d | sed -r \'s/\\.\\/(libsoup.*)-[0-9]+\\.[0-9]+$/\\1/\')',
          '  ln -s $d $d2',
          'done',
        ],
        'working-directory': '{{prefix}}/include',
      },
    ],
    env: {
      MESON_ARGS: ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '--wrap-mode=nofallback'],
    },
  },
}
