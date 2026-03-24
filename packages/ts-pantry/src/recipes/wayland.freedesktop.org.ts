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
    script: [
      'cd ".."',
      'curl -L \'https://gitlab.freedesktop.org/wayland/wayland/-/releases/{{version}}/downloads/wayland-{{version}}.tar.xz\' | tar -xJ --strip-components=1',
      'meson $ARGS ..',
      'ninja -v',
      'ninja install -v',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--buildtype=release', '--wrap-mode=nofallback', '-Dtests=false', '-Ddocumentation=false'],
    },
  },
}
