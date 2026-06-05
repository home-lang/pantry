import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnome.org/librsvg",
  name: "librsvg",
  programs: [
    "rsvg-convert",
  ],
  dependencies: {
    'cairographics.org': "^1.18",
    'gnome.org/pango': '1',
    'gnome.org/gdk-pixbuf': '2',
    'gnome.org/glib': '2',
    'gnu.org/gettext': "^0.21",
  },
  buildDependencies: {
    'rust-lang.org/cargo': '0',
    'rust-lang.org': "^1.63",
    'freedesktop.org/pkg-config': "^0.29",
    'gnome.org/gobject-introspection': '1',
    'python.org': ">=3<3.12",
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
    'github.com/lu-zero/cargo-c': "*",
  },
  distributable: {
    url: "https://download.gnome.org/sources/librsvg/{{ version.major }}.{{ version.minor }}/librsvg-{{ version }}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $ARGS\nmake --jobs {{hw.concurrency}} install",
        if: "<2.59",
      },
      {
        run: "mkdir -p {{prefix}}/bin\nln -s {{deps.gnome.org/gdk-pixbuf.prefix}}/bin/gdk-pixbuf-query-loaders {{prefix}}/bin/\nmkdir -p build\nmeson setup build $MESON_ARGS\nmeson compile -C build\nmeson install -C build\nrm {{prefix}}/bin/gdk-pixbuf-query-loaders",
        if: ">=2.59",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{ prefix }}",
        "--enable-pixbuf-loader=yes",
        "--enable-introspection=yes",
        "--disable-Bsymbolic",
      ],
      MESON_ARGS: [
        "--prefix={{prefix}}",
        "--buildtype=release",
        "-Ddocs=disabled",
        "-Dpixbuf-loader=enabled",
        "-Dintrospection=enabled",
      ],
      linux: {
        LDFLAGS: "$LDFLAGS -Wl,-ldl",
      },
    },
  },
  test: {
    script: [
      "cc test.c -lrsvg-{{version.major}}",
      "./a.out",
    ],
  },
}
