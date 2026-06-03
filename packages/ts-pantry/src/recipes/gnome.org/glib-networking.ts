import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/glib-networking',
  name: 'glib-networking',
  programs: [],
  dependencies: {
    'gnome.org/glib': '*',
    'gnutls.org': '*',
    'gnome.org/gsettings-desktop-schemas': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    linux: {
      'llvm.org': '*',
    },
  },
  distributable: {
    url: 'https://download.gnome.org/sources/glib-networking/{{version.marketing}}/glib-networking-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson $MESON_ARGS build',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dlibproxy=disabled',
        '-Dopenssl=disabled',
        '-Dgnome_proxy=disabled',
      ],
    },
  },
  test: {
    script: [
      'cc gtls-test.c -D_REENTRANT -lgio-2.0 -lgobject-2.0 -lglib-2.0 -o test',
      './test',
    ],
  },
}
