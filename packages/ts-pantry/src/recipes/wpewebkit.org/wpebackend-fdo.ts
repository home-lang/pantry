import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wpewebkit.org/wpebackend-fdo',
  name: 'wpebackend-fdo',
  programs: [],
  dependencies: {
    'gnome.org/glib': '*',
    'github.com/anholt/libepoxy': '*',
    'wpewebkit.org/libwpe': '*',
    'mesa3d.org': '*',
    'wayland.freedesktop.org': '*',
  },
  buildDependencies: {
    'gnu.org/gcc': '*',
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://github.com/Igalia/WPEBackend-fdo/releases/download/{{version}}/wpebackend-fdo-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP ws-egl.h',
        if: '1.16.1',
        'working-directory': 'src',
      },
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      LDFLAGS: '-fPIC',
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
      'make wpe-fdo-test',
      './wpe-fdo-test | grep {{version}}',
    ],
  },
}
