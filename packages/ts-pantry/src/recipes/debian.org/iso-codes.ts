import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "debian.org/iso-codes",
  name: "iso-codes",
  programs: [],
  dependencies: {
    'gnu.org/gettext': "*",
  },
  buildDependencies: {
    'python.org': "<3.12",
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
  },
  distributable: {
    url: "https://deb.debian.org/debian/pool/main/i/iso-codes/iso-codes_{{version}}.orig.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $CONFIGURE_ARGS\nmake --jobs {{hw.concurrency}}\nmake --jobs {{hw.concurrency}} install",
        if: "<4.20.1",
      },
      {
        run: "meson setup build ${MESON_ARGS}\nmeson compile -C build --jobs {{hw.concurrency}}\nmeson install -C build",
        if: ">=4.20.1",
      },
    ],
    env: {
      MESON_ARGS: [
        "--strip",
        "--buildtype=release",
        "--prefix={{prefix}}",
        "--libdir={{prefix}}/lib",
      ],
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\"{{prefix}}\"",
        "--libdir=\"{{prefix}}/lib\"",
      ],
    },
  },
  test: {
    script: [
      "pkg-config --modversion iso-codes | tee out",
      "grep {{version}} out",
      "pkg-config --variable=domains iso-codes | tee out",
      "for x in iso_639-2 iso_639-3 iso_639-5 iso_3166-1 iso_3166-2 iso_3166-3 iso_4217 iso_15924; do",
      "grep $x out",
      "done",
    ],
  },
}
