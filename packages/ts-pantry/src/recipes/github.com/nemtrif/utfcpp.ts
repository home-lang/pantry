import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/nemtrif/utfcpp",
  name: "utfcpp",
  programs: [],
  buildDependencies: {
    'cmake.org': '3',
    darwin: {
      'gnu.org/gcc': '13',
    },
  },
  distributable: {
    url: "https://github.com/nemtrif/utfcpp/archive/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      "cmake .. $ARGS",
      "cmake --build .",
      "cmake --install .",
      {
        run: "if test -d include/utf8cpp; then\n  mv include/utf8cpp/* include/\n  rmdir include/utf8cpp\nfi\nln -s . include/utf8cpp\nmkdir -p lib/cmake\nln -s ../../share/utf8cpp/cmake lib/cmake/utf8cpp\n",
        if: ">=4",
        'working-directory': "${{prefix}}",
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_INSTALL_LIBDIR=lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
      ],
    },
  },
  test: {
    script: [
      "cp $FIXTURE CMakeLists.txt",
      "cp $FIXTURE CMakeLists.txt",
      "cp $FIXTURE CMakeLists.txt",
      "cp $FIXTURE utf8_append.cpp",
      "cmake . -DCMAKE_PREFIX_PATH:STRING=\"test\" -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON",
      "make",
      "./utf8_append",
    ],
  },
}
