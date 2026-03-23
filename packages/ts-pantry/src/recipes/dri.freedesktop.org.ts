import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'dri.freedesktop.org',
  name: 'libdrm',
  programs: [],
  platforms: ['linux'],
  distributable: {
    url: 'https://dri.freedesktop.org/libdrm/libdrm-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'x.org/pciaccess': '*',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'freedesktop.org/pkg-config': '*',
    'python.org': '~3.11',
  },

  build: {
    script: [
      'meson $ARGS ..',
      'ninja -j {{ hw.concurrency }}',
      'ninja -j {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--libdir="{{prefix}}/lib"', '--buildtype=release', '--wrap-mode=nofallback'],
    },
  },
}
