import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "dkrz.de/libaec",
  name: "libaec",
  programs: [],
  buildDependencies: {
    'cmake.org': "*",
  },
  distributable: {
    url: "https://github.com/MathisRosenhauer/libaec/releases/download/v{{version}}/libaec-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./configure $ARGS\nmake --jobs {{ hw.concurrency }} install",
        if: "<1.1.4",
      },
      {
        run: "cmake -S . -B build $CMAKE_ARGS\ncmake --build build\ncmake --install build",
        if: ">=1.1.4",
      },
    ],
    env: {
      ARGS: [
        "--prefix={{prefix}}",
      ],
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DBUILD_SHARED_LIBS=ON",
      ],
    },
  },
}
