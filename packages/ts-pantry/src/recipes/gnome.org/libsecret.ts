import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnome.org/libsecret",
  name: "libsecret",
  programs: [],
  dependencies: {
    'gnome.org/glib': "*",
    'gnupg.org/libgcrypt': "*",
    'gnupg.org/libgpg-error': "*",
  },
  buildDependencies: {
    'docbook.org/xsl': "*",
    'gnu.org/gettext': "*",
    'gnome.org/gobject-introspection': "*",
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
    'freedesktop.org/pkg-config': "*",
    'gnome.org/vala': "*",
    'gnome.org/libxslt': "*",
    'freedesktop.org/dbus': "*",
    linux: {
      'llvm.org': "*",
    },
  },
  distributable: {
    url: "https://download.gnome.org/sources/libsecret/{{version.marketing}}/libsecret-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      "meson .. $MESON_ARGS",
      {
        run: "sed -i.bak \"s|http://docbook.sourceforge.net/release/xsl/current|{{deps.docbook.org/xsl.prefix}}/libexec/docbook-xsl|g\" meson.build\nrm meson.build.bak\n",
        'working-directory': "$SRCROOT/docs/man",
      },
      "ninja --verbose",
      "ninja install --verbose",
      {
        run: "ln -s libsecret-1/libsecret libsecret",
        'working-directory': "{{prefix}}/include",
      },
      {
        run: "ln -s libsecret-1/libsecret libsecret",
        'working-directory': "{{prefix}}/include",
      },
    ],
    env: {
      linux: {
        CC: "clang",
        CXX: "clang++",
        LD: "clang",
        CFLAGS: "-Wno-incompatible-function-pointer-types $CFLAGS",
      },
      XML_CATALOG_FILES: "{{prefix}}/etc/xml/catalog",
      MESON_ARGS: [
        "--prefix=\"{{prefix}}\"",
        "--libdir=\"{{prefix}}/lib\"",
        "--buildtype=release",
        "--wrap-mode=nofallback",
        "-Dgtk_doc=false",
      ],
    },
  },
  test: {
    script: [
      "cc test.c -o test",
      "./test",
      "pkg-config --modversion libsecret-1 | grep {{version}}",
    ],
  },
}
