import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "chiark.greenend.org.uk/puzzles",
  name: "puzzles",
  programs: [],
  dependencies: {
    linux: {
      'gtk.org/gtk3': "*",
    },
  },
  buildDependencies: {
    'cmake.org': ">=3.5",
    'chiark.greenend.org.uk/halibut': "*",
    linux: {
      'llvm.org': 20,
    },
  },
  distributable: {
    url: "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/puzzles.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cmake . $ARGS",
      "cmake --build . -j {{ hw.concurrency }}",
      "cmake --install .",
      {
        run: "install -Dm755 $PROP puzzles",
        if: "darwin",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
      ],
      linux: {
        ARGS: [
          "-Dbuild_icons=FALSE",
        ],
      },
    },
  },
  test: {
    script: [
      "map --generate",
      "puzzles --help\ntest \"$(puzzles --version)\" = \"puzzles {{version}}-pkgx\"",
    ],
  },
}
