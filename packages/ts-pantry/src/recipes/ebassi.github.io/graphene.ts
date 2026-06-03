import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ebassi.github.io/graphene',
  name: 'graphene',
  programs: [],
  dependencies: {
    'gnome.org/glib': '*',
  },
  buildDependencies: {
    'gnome.org/gobject-introspection': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/ebassi/graphene/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson $MESON_ARGS ..',
      'ninja -v',
      'ninja install -v',
    ],
    env: {
      MESON_ARGS: [
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion graphene-1.0 | grep {{version}}',
      'cc test.c $(pkg-config --cflags graphene-1.0 graphene-gobject-1.0) $(pkg-config --libs graphene-1.0 graphene-gobject-1.0) -o test',
      './test',
    ],
  },
}
