import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/vdpau',
  name: 'vdpau',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/exts': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/vdpau/libvdpau/-/archive/{{version.marketing}}/libvdpau-{{version.marketing}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      'meson setup build $ARGS',
      'meson compile -C build --verbose',
      'meson install -C build',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion vdpau | grep {{version.marketing}}',
    ],
  },
}
