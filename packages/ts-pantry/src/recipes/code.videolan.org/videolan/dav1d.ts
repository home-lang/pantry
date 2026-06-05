import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'code.videolan.org/videolan/dav1d',
  name: 'dav1d',
  programs: [
    'dav1d',
  ],
  buildDependencies: {
    'x86-64': {
      'nasm.us': '2.14',
    },
    'mesonbuild.com': '>=0.49',
    'ninja-build.org': '1',
  },
  distributable: {
    url: 'https://code.videolan.org/videolan/dav1d/-/archive/{{version}}/dav1d-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'meson .. --prefix={{prefix}} --libdir={{prefix}}/lib --buildtype=release',
      'ninja -v',
      'ninja install',
    ],
    env: {
      CC: 'clang',
    },
  },
  test: {
    script: [
      'dav1d --version',
    ],
  },
}
