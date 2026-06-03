import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/skystrife/cpptoml",
  name: "cpptoml",
  programs: [],
  buildDependencies: {
    'cmake.org': "*",
    linux: {
      'gnu.org/gcc': 13,
    },
  },
  distributable: {
    url: "https://github.com/skystrife/cpptoml/archive/v0.1.1.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cmake -S . -B build $ARGS",
      "cmake --build build",
      "cmake --install build",
      {
        run: "sed -i '/#include <iomanip>/a\\\n// missing include -pkgx\\\n\\#include <limits>' cpptoml.h\n",
        'working-directory': "${{prefix}}/include",
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DENABLE_LIBCXX=\"ON\"",
        "-DCPPTOML_BUILD_EXAMPLES=OFF",
      ],
      linux: {
        CC: "gcc",
        CXX: "g++",
        LD: "gcc",
      },
    },
  },
  test: {
    script: [
      "g++ -std=c++11 test.cc -o test",
      "test \"$(./test)\" = \"Hello, pkgx.\"",
    ],
  },
}
