import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/strukturag/libde265",
  name: "libde265",
  programs: [],
  buildDependencies: {
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'cmake.org': "*",
  },
  distributable: {
    url: "https://github.com/strukturag/libde265/releases/download/v{{ version }}/libde265-{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $ARGS\nmake --jobs {{ hw.concurrency }} install",
        if: "<1.0.17",
      },
      {
        run: "cmake -S . -B build $CMAKE_ARGS\ncmake --build build\ncmake --install build",
        if: ">=1.0.17",
      },
    ],
    env: {
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DENABLE_SDL=OFF",
        "-DENABLE_TOOLS=ON",
      ],
      linux: {
        CMAKE_ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-lpthread",
        ],
      },
      ARGS: [
        "--prefix=\"{{prefix}}\"",
        "--disable-dependency-tracking",
        "--disable-silent-rules",
        "--disable-sherlock265",
        "--disable-dec265",
      ],
      'darwin/aarch64': {
        ARGS: [
          "--build=\"aarch64-apple-darwin$(uname -r)\"",
        ],
      },
    },
  },
  test: {
    script: [
      "pkg-config --modversion libde265 | grep {{ version }}",
    ],
  },
}
