import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
    'gnome.org/libxml2': '*',
    'sqlite.org': '*',
    'nghttp2.org': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '~3.11',
  },

  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
      'cd "{{prefix}}/include"',
      'DIRS=$(find . -mindepth 1 -maxdepth 1 -type d -name libsoup\\*)',
      'for d in $DIRS; do',
      '  d2=$(echo $d | sed -r \'s/\\.\\/(libsoup.*)-[0-9]+\\.[0-9]+$/\\1/\')',
      '  ln -s $d $d2',
      'done',
      '',
      'cd "{{prefix}}/lib"',
      'SQLITE="$(ldd libsoup-*.so | sed -n \'/libsqlite3.so/s/=>.*//p\')"',
      'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so libsoup-*.so',
      'cd "{{prefix}}/lib"',
      'SQLITE="$(ldd libsoup-*.so | sed -n \'/libsqlite3.so/s/=>.*//p\'")',
      'patchelf --replace-needed {{deps.sqlite.org.prefix}}/lib/libsqlite3.so libsqlite3.so libsoup-*.so',
    ],
    env: {
      'MESON_ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '--wrap-mode=nofallback', '-Dintrospection=disabled', '-Dvapi=disabled'],
    },
  },
}
