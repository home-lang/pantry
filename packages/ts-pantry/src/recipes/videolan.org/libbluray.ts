import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "videolan.org/libbluray",
  name: "libbluray",
  programs: [],
  dependencies: {
    'freedesktop.org/fontconfig': "*",
    'freetype.org': "*",
    'gnome.org/libxml2': "~2.13",
  },
  buildDependencies: {
    'gnu.org/automake': "*",
    'gnu.org/autoconf': "*",
    'gnu.org/libtool': "*",
    'mesonbuild.com': "^1",
    'ninja-build.org': "^1",
  },
  distributable: {
    url: "https://download.videolan.org/videolan/libbluray/{{version}}/libbluray-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./bootstrap\n./configure $ARGS\nmake\nmake install",
        if: "<1.4",
      },
      {
        run: "meson setup build $MESON_ARGS\nmeson compile -C build\nmeson install -C build",
        if: ">=1.4",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
        "--disable-dependency-tracking",
        "--disable-silent-rules",
        "--disable-bdjava-jar",
      ],
      MESON_ARGS: [
        "--prefix={{prefix}}",
        "-Dbdj_jar=disabled",
      ],
    },
  },
  test: {
    script: [
      "cc test.c -lbluray -o test",
      "./test",
    ],
  },
}
