import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/hughsie/libxmlb',
  name: 'libxmlb',
  programs: [
    'xb-tool',
  ],
  dependencies: {
    'gnome.org/glib': 2,
    'tukaani.org/xz': 5,
    'facebook.com/zstd': 1,
  },
  buildDependencies: {
    'gnome.org/gobject-introspection': '~1.86',
    'mesonbuild.com': '~1.9',
    'ninja-build.org': '*',
    'python.org': '~3.11',
    'gnome.org/vala': '*',
  },
  distributable: {
    url: 'https://github.com/hughsie/libxmlb/releases/download/{{version.tag}}/libxmlb-{{version.tag}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build --prefix={{prefix}} -Dgtkdoc=false',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
  test: {
    script: [
      'cc -o test $FIXTURE $(pkg-config --cflags --libs xmlb)',
      './test',
    ],
  },
}
