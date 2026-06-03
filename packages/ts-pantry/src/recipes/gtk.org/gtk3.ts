import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gtk.org/gtk3',
  name: 'gtk3',
  programs: [
    'gtk-builder-tool',
    'gtk-encode-symbolic-svg',
    'gtk-launch',
    'gtk-query-immodules-3.0',
    'gtk-query-settings',
    'gtk-update-icon-cache',
    'gtk3-demo',
    'gtk3-demo-application',
    'gtk3-icon-browser',
    'gtk3-widget-factory',
  ],
  dependencies: {
    'gnome.org/atk': '*',
    'gnome.org/gdk-pixbuf': '*',
    'gnome.org/glib': '*',
    'gnome.org/gsettings-desktop-schemas': '*',
    'freedesktop.org/icon-theme': '*',
    'github.com/anholt/libepoxy': '*',
    'gnome.org/pango': '*',
    'gnome.org/libxslt': '*',
    'x.org/x11': '*',
    'x.org/exts': '*',
    'x.org/xrender': '*',
    'x.org/xrandr': '*',
    'x.org/xi': '*',
    'ebassi.github.io/graphene': '*',
    'xkbcommon.org': '*',
    'debian.org/iso-codes': '*',
    'freedesktop.org/at-spi2-atk': '*',
    linux: {
      'cairographics.org': '*',
      'wayland.freedesktop.org/protocols': '*',
      'x.org/protocol': '*',
      'openprinting.github.io/cups': '*',
    },
  },
  buildDependencies: {
    'docbook.org': '*',
    'docbook.org/xsl': '*',
    'gnu.org/gettext': '*',
    'gnome.org/gobject-introspection': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    linux: {
      'cmake.org': '*',
    },
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gtk+/{{version.marketing}}/gtk+-{{version}}.tar.xz',
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
        '-Dintrospection=true',
      ],
      darwin: {
        MESON_ARGS: [
          '-Dquartz_backend=true',
          '-Dx11_backend=false',
        ],
      },
      DESTDIR: '/',
      XML_CATALOG_FILES: '{{prefix}}/etc/xml/catalog',
    },
  },
  test: {
    script: [
      'pkg-config --modversion gtk+-3.0 | grep {{version}}',
      'cc test.c $(pkg-config --cflags --libs gtk+-3.0) -o test',
      './test',
    ],
  },
}
