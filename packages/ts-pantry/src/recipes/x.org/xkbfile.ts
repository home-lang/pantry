import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "x.org/xkbfile",
  name: "xkbfile",
  programs: [],
  dependencies: {
    'x.org/x11': "*",
  },
  buildDependencies: {
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
  },
  distributable: {
    url: "https://www.x.org/archive/individual/lib/libxkbfile-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $CONFIGURE_ARGS\nmake --jobs {{ hw.concurrency }}\nmake --jobs {{ hw.concurrency }} install",
        if: "<1.2",
      },
      {
        run: "meson setup builddir $MESON_ARGS\nmeson compile -C builddir\nmeson install -C builddir",
        if: ">=1.2",
      },
    ],
    env: {
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\{{prefix}}\",
        "--libdir=\{{prefix}}/lib\",
      ],
      MESON_ARGS: [
        "--prefix={{prefix}}",
        "--libdir={{prefix}}/lib",
      ],
    },
  },
  test: {
    script: [
      "cc test.c -o test",
      "./test",
      "pkg-config --modversion xkbfile | grep {{version}}",
    ],
  },
}
