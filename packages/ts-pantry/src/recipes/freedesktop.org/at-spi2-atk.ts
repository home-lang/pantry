import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "freedesktop.org/at-spi2-atk",
  name: "at-spi2-atk",
  programs: [],
  dependencies: {
    'gnome.org/atk': "*",
    'gnome.org/libxml2': "*",
    'freedesktop.org/dbus': "*",
    'x.org/xtst': "*",
  },
  buildDependencies: {
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
    'freedesktop.org/pkg-config': "*",
    'python.org': "~3.11",
    'git-scm.org': "*",
    // The bundled at-spi2-core meson subproject builds atk with
    // introspection, so it needs gobject-introspection-1.0 and glib-2.0 at
    // build time (configure errors with "Dependency gobject-introspection-1.0
    // not found" otherwise).
    'gnome.org/gobject-introspection': "*",
    'gnome.org/glib': "*",
    linux: {
      'llvm.org': "*",
    },
  },
  distributable: {
    url: "https://download.gnome.org/sources/at-spi2-atk/{{version.marketing}}/at-spi2-atk-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: "sed -i.bak \"s|revision=master|revision=main|g\" at-spi2-core.wrap\nrm at-spi2-core.wrap.bak\n",
        'working-directory': "../subprojects",
      },
      "meson --prefix={{prefix}} --libdir={{prefix}}/lib ..",
      "ninja",
      "ninja install",
    ],
    env: {
      linux: {
        LD: "clang",
      },
    },
  },
  test: {
    script: [
      "pkg-config --modversion atk-bridge-2.0 | grep {{version}}",
      "cc test.c $(pkg-config --cflags --libs atk-bridge-2.0 glib-2.0 atk) -o test",
      "./test 2>&1 | grep \"atk_bridge_adaptor_init\"",
    ],
  },
}
