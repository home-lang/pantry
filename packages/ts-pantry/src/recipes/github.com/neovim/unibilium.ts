import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/neovim/unibilium",
  name: "unibilium",
  programs: [],
  buildDependencies: {
    'cmake.org': "^3",
    'gnu.org/libtool': "*",
  },
  distributable: {
    url: "https://github.com/neovim/unibilium/archive/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "make --jobs {{ hw.concurrency }}\nmake --jobs {{ hw.concurrency }} install PREFIX={{prefix}}",
        if: "<2.1.2",
      },
      {
        run: "cmake -B build $CMAKE_ARGS\ncmake --build build\ncmake --install build",
        if: ">=2.1.2",
      },
    ],
    env: {
      CMAKE_ARGS: [
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DBUILD_SHARED_LIBS=ON",
      ],
    },
  },
  test: {
    script: [
      "pkg-config --modversion unibilium | grep {{version}}",
      "cc test.c -lunibilium -o test",
      "./test",
    ],
  },
}
