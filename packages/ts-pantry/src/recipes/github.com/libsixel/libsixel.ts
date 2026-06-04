import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/libsixel/libsixel',
  name: 'libsixel',
  programs: [
    'img2sixel',
    'sixel2png',
    'libsixel-config',
  ],
  dependencies: {
    'libjpeg-turbo.org': '*',
    'libpng.org': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': 1,
  },
  distributable: {
    url: 'https://github.com/libsixel/libsixel/archive/refs/tags/v{{version}}.tar.gz',
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
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '-Dgdk-pixbuf2=disabled',
        '-Dtests=disabled',
      ],
    },
  },
  test: {
    script: [
      'img2sixel --version',
    ],
  },
}
