import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gstreamer.freedesktop.org/orc',
  name: 'orc',
  programs: [
    'orcc',
    'orc-bugreport',
  ],
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
  },
  distributable: {
    url: 'https://gstreamer.freedesktop.org/src/orc/orc-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'export ARGS="$(echo $ARGS | sed s\'/gtk_doc/hotdoc/\')"',
        if: '>=0.4.42',
      },
      'meson $ARGS ..',
      'ninja -v',
      'ninja install -v',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dgtk_doc=disabled',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion orc-{{version.marketing}} | grep {{version}}',
    ],
  },
}
