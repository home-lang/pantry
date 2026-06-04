import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "jpeg.org/jpegxl",
  name: "jpegxl",
  programs: [
    "cjxl",
    "djxl",
    "jxlinfo",
  ],
  dependencies: {
    'github.com/google/brotli': "^1",
    'littlecms.com': "^2.13",
    'google.com/highway': "^1",
    'google.com/webp': "^1",
    'giflib.sourceforge.io': "^5",
    'openexr.com': "^3",
    'libpng.org': "^1",
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': "^0.29",
    'cmake.org': "^3",
    'gnu.org/coreutils': "*",
    'git-scm.org': "^2",
  },
  distributable: {
    url: "git+https://github.com/libjxl/libjxl.git",
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: "./deps.sh\nfind third_party -not -name sjpeg -and -not -name libjpeg-turbo -mindepth 1 -maxdepth 1 -type d | xargs rm -rf",
        'working-directory': "..",
      },
      "cmake .. $ARGS",
      "make --jobs {{ hw.concurrency }} install",
    ],
    env: {
      ARGS: [
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DBUILD_TESTING=OFF",
        "-DJPEGXL_ENABLE_SKCMS=OFF",
        "-DJPEGXL_ENABLE_BENCHMARK=OFF",
        "-DJPEGXL_VERSION={{version}}",
      ],
      'linux/x86-64': {
        ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,--allow-shlib-undefined,-lstdc++fs",
        ],
      },
      'linux/aarch64': {
        ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,-lstdc++fs",
        ],
      },
    },
  },
  test: {
    script: [
      "cjxl fixture.jpeg out.jxl",
      "cc fixture1.c -ljxl",
      "./a.out",
      "cc fixture2.c -ljxl_threads",
      "./a.out",
    ],
  },
}
