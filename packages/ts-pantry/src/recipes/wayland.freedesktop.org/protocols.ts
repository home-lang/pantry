import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wayland.freedesktop.org/protocols',
  name: 'protocols',
  programs: [],
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '~3.11',
    'wayland.freedesktop.org': '*',
    'curl.se': '*',
  },
  // The gitlab releases/downloads endpoint 403s for automated clients (so pkgx
  // disabled its distributable). The gitlab `/-/archive/` tarball still works, and
  // wayland-protocols tags are 2-component (e.g. `1.47`, == version.marketing).
  distributable: {
    url: 'https://gitlab.freedesktop.org/wayland/wayland-protocols/-/archive/{{version.marketing}}/wayland-protocols-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'meson $ARGS ..',
      'ninja -v',
      'ninja install -v',
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
      'pkg-config --modversion wayland-protocols',
      'pkg-config --modversion wayland-protocols | grep {{version.marketing}}',
    ],
  },
}
