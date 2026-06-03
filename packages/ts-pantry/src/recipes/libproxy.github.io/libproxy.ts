import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "libproxy.github.io/libproxy",
  name: "libproxy",
  programs: [
    "proxy",
  ],
  dependencies: {
    'duktape.org': "*",
    'gnome.org/glib': "*",
    'curl.se': "*",
    linux: {
      'freedesktop.org/dbus': "*",
      'llvm.org': "*",
    },
  },
  buildDependencies: {
    'gnome.org/gobject-introspection': "*",
    'gnome.org/gsettings-desktop-schemas': "*",
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
    'freedesktop.org/pkg-config': "*",
    'gnome.org/vala': "*",
  },
  distributable: {
    url: "https://github.com/libproxy/libproxy/archive/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "meson setup build $MESON_ARGS",
      "meson compile -C build --verbose",
      "meson install -C build",
      {
        run: "if test -d libproxy; then\n  mv libproxy/* .\n  rmdir libproxy\n  ln -s . libproxy\nfi\n",
        'working-directory': "{{prefix}}/lib",
      },
    ],
    env: {
      MESON_ARGS: [
        "--prefix={{prefix}}",
        "--libdir={{prefix}}/lib",
        "--buildtype=release",
        "--wrap-mode=nofallback",
        "-Ddocs=false",
      ],
      linux: {
        LD: "clang",
        CC: "clang",
        CXX: "clang++",
      },
    },
  },
  test: {
    script: [
      "proxy https://tea.xyz/ | grep \"direct://\"",
    ],
  },
}
