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
  distributable: undefined,
  build: {
    'working-directory': 'build',
    script: [
      {
        run: 'curl -L \'https://gitlab.freedesktop.org/wayland/wayland-protocols/-/releases/{{version.tag}}/downloads/wayland-protocols-{{version.tag}}.tar.xz\' | tar -xJ --strip-components=1',
        'working-directory': '..',
      },
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
