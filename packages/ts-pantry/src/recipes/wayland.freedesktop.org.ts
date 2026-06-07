import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wayland.freedesktop.org',
  name: 'wayland',
  programs: ['wayland-scanner'],
  platforms: ['linux'],
  distributable: null,
  dependencies: {
    'libexpat.github.io': '*',
    'sourceware.org/libffi': '*',
    'gnome.org/libxml2': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'gnu.org/make': '*',
    'cmake.org': '*',
    'freedesktop.org/pkg-config': '*',
    'curl.se': '*',
    'tukaani.org/xz': '*',
  },

  build: {
    'working-directory': 'build',
    script: [
      // gitlab.freedesktop.org's `-/releases/.../downloads/` path 403s from GitHub
      // Actions runners; the generic `-/archive/` endpoint serves the same source
      // tree (top-level `wayland-{{version}}/`, full meson build) and is reachable.
      // Extract one level up (in the buildDir root, the parent of `build/`) so the
      // subsequent `meson $ARGS ..` from inside `build/` sees the source tree.
      {
        run: 'curl -L \'https://gitlab.freedesktop.org/wayland/wayland/-/archive/{{version}}/wayland-{{version}}.tar.gz\' | tar -xz --strip-components=1',
        'working-directory': '..',
      },
      'meson $ARGS ..',
      'ninja -v',
      'ninja install -v',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '--wrap-mode=nofallback', '-Dtests=false', '-Ddocumentation=false'],
    },
  },
}
