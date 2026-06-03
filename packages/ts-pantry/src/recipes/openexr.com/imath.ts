import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "openexr.com/imath",
  name: "imath",
  programs: [],
  buildDependencies: {
    'cmake.org': "*",
  },
  distributable: {
    url: "https://github.com/AcademySoftwareFoundation/Imath/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cmake -S . -B build $ARGS",
      "cmake --build build",
      "cmake --install build",
    ],
    env: {
      ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_BUILD_TYPE=Release",
      ],
    },
  },
  test: {
    script: [
      "if ! test -f /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/AvailabilityInternalLegacy.h; then\n  echo \"Missing SDK; skipping remaining tests\"\n  exit 0\nfi\n",
      "c++ -std=c++11 -lImath $FIXTURE",
      "./a.out",
    ],
  },
}
