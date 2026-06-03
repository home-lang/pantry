import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "sourceforge.net/faad2",
  name: "faad2",
  programs: [
    "faad",
  ],
  buildDependencies: {
    'cmake.org': "*",
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'gnu.org/libtool': "*",
    linux: {
      'gnu.org/gcc': "*",
    },
  },
  distributable: {
    url: "https://github.com/knik0/faad2/archive/refs/tags/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "./bootstrap\n./configure $CONFIGURE_ARGS\nmake --jobs {{ hw.concurrency }} install\n",
        if: "<2.11",
      },
      {
        run: "cmake .. $CMAKE_ARGS\ncmake --build .\ncmake --install .\n",
        if: ">=2.11",
        'working-directory': "build",
      },
    ],
    env: {
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\"{{prefix}}\"",
        "--libdir=\"{{prefix}}/lib\"",
      ],
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX=\"{{prefix}}\"",
      ],
    },
  },
  test: {
    script: [
      "faad -h > output.txt || true",
      "cat output.txt | grep infile.mp4",
    ],
  },
}
