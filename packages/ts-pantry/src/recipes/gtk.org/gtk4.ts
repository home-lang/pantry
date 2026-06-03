import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gtk.org/gtk4',
  name: 'gtk4',
  programs: [
    'gtk4-builder-tool',
    'gtk4-demo',
    'gtk4-demo-application',
    'gtk4-launch',
    'gtk4-node-editor',
    'gtk4-query-settings',
    'gtk4-print-editor',
    'gtk4-rendernode-tool',
    'gtk4-update-icon-cache',
    'gtk4-widget-factory',
  ],
  dependencies: {
    'gnome.org/gdk-pixbuf': '^2.42',
    'gnome.org/glib': '^2.78',
    'gnome.org/librsvg': '^2.60',
    'ebassi.github.io/graphene': '^1.10',
    'freedesktop.org/icon-theme': '^0.17',
    'libjpeg-turbo.org': '^2',
    'github.com/anholt/libepoxy': '^1.5.10',
    'libpng.org': '^1.6',
    'simplesystems.org/libtiff': '^4.6',
    'gnome.org/pango': '^1.50',
    'openprinting.github.io/cups': '^2.4',
    'github.com/KhronosGroup/Vulkan-Loader': '^1',
    'github.com/google/shaderc': '^2023',
    linux: {
      'x.org/xi': '^1.8',
      'x.org/xinerama': '^1.1',
      'x.org/xcursor': '^1.2',
      'xkbcommon.org': '^1.6',
      'cairographics.org': '^1.18',
      'wayland.freedesktop.org/protocols': '^1.43',
    },
  },
  buildDependencies: {
    'docbook.org': '*',
    'docbook.org/xsl': '*',
    'gnu.org/gettext': '*',
    'gnome.org/gobject-introspection': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'sass-lang.com/sassc': '*',
    'gnome.org/libxslt': '*',
    'gnome.org/libxml2': '~2.13',
    'cmake.org': '*',
    linux: {
      'gnu.org/binutils': '*',
      'kernel.org/linux-headers': '*',
    },
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gtk/{{version.marketing}}/gtk-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'export MESON_ARGS="$MESON_ARGS -Dgtk_doc=false"',
        if: '<4.15.0',
      },
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dbuild-examples=false',
        '-Dbuild-tests=false',
        '-Dmedia-gstreamer=disabled',
      ],
      darwin: {
        MESON_ARGS: [
          '-Dx11-backend=false',
          '-Dmacos-backend=true',
        ],
      },
      DESTDIR: '/',
      XML_CATALOG_FILES: '{{prefix}}/etc/xml/catalog',
      CPPFLAGS: [
        '-DG_DISABLE_ASSERT',
        '-DG_DISABLE_CAST_CHECKS',
      ],
      linux: {
        PATH: '${{deps.gnu.org/binutils.prefix}}/bin:$PATH',
        LDFLAGS: '$LDFLAGS -Wl,-lpthread,--allow-shlib-undefined',
      },
    },
  },
  test: {
    script: [
      'pkg-config --modversion gtk4 | grep {{version}}',
      'cc test.c $(pkg-config --cflags --libs gtk4) -o test',
      './test',
    ],
  },
}
