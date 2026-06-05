import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/PyGObject',
  name: 'PyGObject',
  programs: [],
  dependencies: {
    'gnome.org/gobject-introspection': '*',
    'cairographics.org/pycairo': '*',
    // PyGObject 3.50+ depends on the girepository-2.0 pkg-config module, which
    // moved out of gobject-introspection and into glib (2.80+). Without glib on
    // the build, meson errors "Dependency 'girepository-2.0' is required but
    // not found".
    'gnome.org/glib': '>=2.80',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/pygobject/{{version.marketing}}/pygobject-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $MESON_ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
    ],
    env: {
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dpycairo=enabled',
      ],
    },
  },
  test: {
    script: [
      'python -c \'import gi; print(gi.__version__)\' | grep {{version}}',
    ],
  },
}
