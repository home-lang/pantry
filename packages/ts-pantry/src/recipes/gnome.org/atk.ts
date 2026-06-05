import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/atk',
  name: 'atk',
  programs: [],
  dependencies: {
    'gnome.org/glib': '2',
  },
  buildDependencies: {
    'mesonbuild.com': '^0.63',
    'ninja-build.org': '1',
    'freedesktop.org/pkg-config': '^0.29',
    'gnu.org/gettext': '^0.21',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/atk/{{ version.major }}.{{ version.minor }}/atk-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build',
      'meson install -C build',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--wrap-mode=nofallback',
        '--buildtype=release',
        '-Dintrospection=false',
        '-Ddocs=false',
      ],
    },
  },
  test: {
    script: [
      'cp $FIXTURE test.c',
      'cc -o test test.c `pkg-config --cflags --libs atk`',
      './test',
    ],
  },
}
