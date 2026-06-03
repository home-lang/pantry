import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/PyGObject',
  name: 'PyGObject',
  programs: [],
  dependencies: {
    'gnome.org/gobject-introspection': '*',
    'cairographics.org/pycairo': '*',
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
