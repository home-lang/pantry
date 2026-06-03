import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "facebook.com/zstd",
  name: "zstd",
  programs: [
    "pzstd",
    "unzstd",
    "zstd",
    "zstdcat",
    "zstdgrep",
    "zstdless",
    "zstdmt",
  ],
  dependencies: {
    'lz4.org': "^1",
    'tukaani.org/xz': "^5",
    'zlib.net': "^1",
  },
  buildDependencies: {
    'cmake.org': "^3",
    'ninja-build.org': "^1",
  },
  distributable: {
    url: "https://github.com/facebook/zstd/archive/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cmake ../cmake $ARGS",
      "cmake --build .",
      "cmake --install .",
      {
        run: "install_name_tool -add_rpath @loader_path/../lib pzstd\ninstall_name_tool -add_rpath @loader_path/../lib zstd\n",
        if: "darwin",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "-GNinja",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX=\"{{prefix}}\"",
        "-DZSTD_PROGRAMS_LINK_SHARED=ON",
        "-DZSTD_BUILD_CONTRIB=ON",
        "-DZSTD_LEGACY_SUPPORT=ON",
        "-DZSTD_ZLIB_SUPPORT=ON",
        "-DZSTD_LZMA_SUPPORT=ON",
        "-DZSTD_LZ4_SUPPORT=ON",
      ],
      darwin: {
        ARGS: [
          "-DCMAKE_CXX_FLAGS=\"-std=c++11\"",
        ],
      },
    },
  },
  test: {
    script: [
      "test $(echo \"$STRING\" | zstd  | zstd -d) = \"$STRING\"",
      "test $(echo \"$STRING\" | pzstd | zstd -d) = \"$STRING\"",
      "test $(echo \"$STRING\" | xz    | zstd -d) = \"$STRING\"",
      "test $(echo \"$STRING\" | lz4   | zstd -d) = \"$STRING\"",
      "test $(echo \"$STRING\" | gzip  | zstd -d) = \"$STRING\"",
    ],
  },
}
