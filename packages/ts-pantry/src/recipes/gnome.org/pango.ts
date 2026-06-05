import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnome.org/pango',
  name: 'pango',
  programs: [
    'pango-list',
    'pango-segmentation',
    'pango-view',
  ],
  dependencies: {
    'cairographics.org': '^1.18',
    'freetype.org': 2,
    'gnome.org/glib': 2,
    'harfbuzz.org': 8,
    'freedesktop.org/fontconfig': 2,
    'sourceware.org/libffi': 3,
    'gnu.org/fribidi': 1,
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': 1,
    'freedesktop.org/pkg-config': '^0.29',
    'gnome.org/gobject-introspection': 1,
    'python.org': '>=3<3.12',
  },
  distributable: {
    url: 'https://download.gnome.org/sources/pango/{{ version.major }}.{{ version.minor }}/pango-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'meson .. $ARGS',
      'ninja --verbose',
      'ninja install',
    ],
    env: {
      ARGS: [
        '-Dcairo=enabled',
        '-Dfontconfig=enabled',
        '-Dfreetype=enabled',
        '--buildtype=release',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        // Pango 1.57+ requires glib >= 2.82. If the build host's system glib is
        // older, meson silently falls back to the bundled `glib.wrap` subproject
        // (which clones glib `main`), compiling pango against bleeding-edge glib
        // headers (e.g. g_variant_builder_init_static) while the result ends up
        // linked against the older system glib at runtime → "undefined symbol:
        // g_variant_builder_init_static". --wrap-mode=nodownload forbids the
        // bundled-glib fallback so pango must use our dependency glib (resolved
        // via PKG_CONFIG_PATH), keeping headers and runtime glib in sync.
        '--wrap-mode=nodownload',
      ],
    },
  },
}
