import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/gsettings-desktop-schemas',
  name: 'gsettings-desktop-schemas',
  programs: [],
  dependencies: {
    'gnome.org/glib': '*',
    'libexpat.github.io': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '~1.9',
    'ninja-build.org': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/gsettings-desktop-schemas/{{version.major}}/gsettings-desktop-schemas-{{version.marketing}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
      {
        run: 'glib-compile-schemas .',
        'working-directory': '{{prefix}}/share/glib-2.0/schemas',
      },
    ],
    env: {
      DESTDIR: '/',
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dintrospection=false',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion gsettings-desktop-schemas | grep {{version.marketing}}',
      'cc test.c -I{{prefix}}/include/gsettings-desktop-schemas -o test',
      './test',
    ],
  },
}
