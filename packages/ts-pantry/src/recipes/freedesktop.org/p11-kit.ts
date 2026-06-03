import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "freedesktop.org/p11-kit",
  name: "p11-kit",
  programs: [
    "p11-kit",
    "trust",
  ],
  dependencies: {
    'sourceware.org/libffi': "^3",
    'curl.se/ca-certs': "*",
    'gnu.org/libtasn1': "^4",
    'gnu.org/gettext': "*",
  },
  buildDependencies: {
    'python.org': 3,
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
  },
  distributable: {
    url: "https://github.com/p11-glue/p11-kit/releases/download/{{ version }}/p11-kit-{{ version }}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure --prefix={{prefix}} --with-trust-paths={{deps.curl.se/ca-certs}}/ssl\nmake -j {{ hw.concurrency }} install",
        if: "<0.25.9",
      },
      {
        run: "meson setup build $MESON_ARGS\nmeson compile -C build\nmeson install -C build",
        if: ">=0.25.9",
      },
      {
        run: "ln -s p11-kit-1/p11-kit .",
        'working-directory': {{prefix}}/include,
      },
    ],
    env: {
      MESON_ARGS: [
        "-Dsystemd=disabled",
        "--prefix={{prefix}}",
        "-Dtrust_paths={{deps.curl.se/ca-certs}}/ssl",
      ],
    },
  },
  test: {
    script: [
      "p11-kit list-modules",
    ],
  },
}
