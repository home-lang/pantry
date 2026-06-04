import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'intel.com/libva',
  name: 'libva',
  programs: [],
  dependencies: {
    'dri.freedesktop.org': '*',
    'x.org/x11': '*',
    'x.org/exts': '*',
    'x.org/xfixes': '*',
    'wayland.freedesktop.org': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://github.com/intel/libva/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'meson .. $ARGS',
      'ninja',
      'ninja install',
    ],
    env: {
      ARGS: [
        '-Dprefix={{prefix}}',
        '-Dsysconfdir={{prefix}}/etc',
        '-Dlibdir={{prefix}}/lib',
        '-Dlocalstatedir={{prefix}}/var',
        '-Dwith_x11=yes',
        '-Dwith_glx=no',
        '-Dwith_wayland=yes',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --cflags libva | grep {{version}}',
      'pkg-config --cflags libva-drm | grep {{version}}',
      'pkg-config --cflags libva-x11 | grep {{version}}',
      'pkg-config --cflags libva-wayland | grep {{version}}',
    ],
  },
}
