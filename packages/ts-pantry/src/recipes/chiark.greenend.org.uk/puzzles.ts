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
      'llvm.org': '20',
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
        // On darwin the cmake build only produces Puzzles.app; install a small
        // `puzzles` launcher wrapper. BSD install has no -D flag, so create the
        // bin dir first and use plain `install -m755`.
        run: "mkdir -p {{prefix}}/bin\ninstall -m755 $PROP {{prefix}}/bin/puzzles",
        if: "darwin",
        prop: {
          content: [
            "#!/bin/sh",
            "",
            "# add --help and --version flags",
            "if [ \"$1\" = \"--help\" ]; then",
            "  echo \"This is a simple wrapper to start the puzzles application.\"",
            "  exit 0",
            "elif [ \"$1\" = \"--version\" ]; then",
            "  echo \"puzzles {{version}}-pkgx\"",
            "  exit 0",
            "fi",
            "",
            "cd \"$(dirname \"$(readlink -f \"$0\")\")/..\"",
            "open Puzzles.app",
          ],
        },
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
