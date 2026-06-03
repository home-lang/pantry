import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "freedesktop.org/icon-theme",
  name: "icon-theme",
  programs: [],
  buildDependencies: {
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
  },
  distributable: {
    url: "https://icon-theme.freedesktop.org/releases/hicolor-icon-theme-{{version.marketing}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $ARGS\nmake --jobs {{ hw.concurrency }} install\n",
        if: "<0.18",
      },
      {
        run: "meson setup build $ARGS\nmeson compile -C build --verbose\nmeson install -C build\n",
        if: ">=0.18",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
      ],
    },
  },
}
