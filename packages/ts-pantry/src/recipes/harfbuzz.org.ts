import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'harfbuzz.org',
  name: 'harfbuzz',
  description: 'HarfBuzz text shaping engine',
  homepage: 'https://harfbuzz.github.io/',
  github: 'https://github.com/harfbuzz/harfbuzz',
  programs: ['hb-ot-shape-closure', 'hb-shape', 'hb-subset', 'hb-view'],
  versionSource: {
    type: 'github-releases',
    repo: 'harfbuzz/harfbuzz',
  },
  distributable: {
    url: 'https://github.com/harfbuzz/harfbuzz/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'cairographics.org': '1',
    'freetype.org': '2',
    'gnome.org/glib': '2',
    'graphite.sil.org': '*',
    'unicode.org': '^71',
  },
  buildDependencies: {
    'mesonbuild.com': '>=0.63',
    'ninja-build.org': '1',
    'freedesktop.org/pkg-config': '^0.29',
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'meson .. $ARGS',
      'ninja --verbose',
      'ninja install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '-Dcairo=enabled', '-Dcoretext=enabled', '-Dfreetype=enabled', '-Dglib=enabled', '-Dgraphite=enabled', '-Dtests=disabled', '-Dintrospection=disabled'],
    },
  },
}
