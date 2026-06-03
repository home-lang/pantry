import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/google/shaderc",
  name: "shaderc",
  programs: [
    "glslc",
  ],
  buildDependencies: {
    'cmake.org': "*",
    'python.org': "~3.12",
    'git-scm.org': "^2",
  },
  distributable: {
    url: "https://github.com/google/shaderc/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "../utils/git-sync-deps",
      {
        run: "sed -i 's/\\${SHADERC_SKIP_INSTALL}/ON/g' CMakeLists.txt\nsed -i '/GLSLANG_ENABLE_INSTALL/s/^/#/' CMakeLists.txt",
        'working-directory': "../third_party",
      },
      "cmake .. $CMAKE_ARGS",
      "cmake --build .",
      "cmake --install .",
    ],
    env: {
      CMAKE_ARGS: [
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DSHADERC_SKIP_TESTS=ON",
        "-DSKIP_GLSLANG_INSTALL=ON",
        "-DSKIP_SPIRV_TOOLS_INSTALL=ON",
        "-DSKIP_GOOGLETEST_INSTALL=ON",
      ],
      linux: {
        CMAKE_ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-lstdc++fs",
        ],
      },
    },
  },
  test: {
    script: [
      "clang -o test $FIXTURE $(pkg-config --cflags --libs shaderc)",
      "./test",
    ],
  },
}
