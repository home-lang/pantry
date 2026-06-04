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
    // gobject-introspection + its python pin were only needed for -Dintrospection;
    // introspection is disabled below (broken in CI), so they are dropped to avoid
    // meson auto-detecting them and to remove the Python 3.14 distutils failure path.
  },

  build: {
    'working-directory': 'build',
    workingDirectory: 'build',
    script: [
      'meson .. $ARGS',
      'ninja --verbose',
      'ninja install',
    ],
    env: {
      // -Dintrospection=disabled and -Dgobject=disabled: the gobject-introspection
      // codegen path is broken in CI — on Linux g-ir-scanner crashes under Python 3.14
      // (distutils.msvccompiler was removed), and on macOS meson's glib-mkenums exe
      // wrapper produces a corrupt command. These only generate .gir/.typelib and
      // GObject bindings, which none of the shipped binaries (hb-shape/hb-subset/hb-view)
      // require. -Ddocs=disabled avoids gtk-doc (auto-enabled) for the same reason.
      'ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '-Dcairo=enabled', '-Dcoretext=enabled', '-Dfreetype=enabled', '-Dglib=enabled', '-Dgobject=disabled', '-Dgraphite=enabled', '-Dintrospection=disabled', '-Ddocs=disabled', '-Dtests=disabled'],
      'linux/x86-64': {
        CFLAGS: '-fPIC',
        CXXFLAGS: '-fPIC',
        LDFLAGS: '-pie',
      },
    },
  },
}
