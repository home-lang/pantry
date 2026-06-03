import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "freedesktop.org/xdg-user-dirs",
  name: "xdg-user-dirs",
  programs: [
    "xdg-user-dir",
    "xdg-user-dirs-update",
  ],
  dependencies: {
    'gnu.org/gettext': "^0.21",
    'gnu.org/libiconv': "^1.1",
  },
  buildDependencies: {
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
  },
  distributable: {
    url: "https://user-dirs.freedesktop.org/releases/xdg-user-dirs-{{version.marketing}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure --prefix=\"{{ prefix }}\" --disable-documentation\nmake --jobs {{ hw.concurrency }} install",
        if: "<0.19",
      },
      {
        run: "meson setup build $MESON_ARGS\nmeson compile -C build\nmeson install -C build",
        if: ">=0.19",
      },
    ],
    env: {
      LDFLAGS: "-liconv",
      MESON_ARGS: [
        "--prefix={{ prefix }}",
        "-Ddocs=false",
      ],
    },
  },
}
