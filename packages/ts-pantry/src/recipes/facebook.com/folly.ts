import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "facebook.com/folly",
  name: "folly",
  programs: [],
  dependencies: {
    'boost.org': "<1.89",
    'gflags.github.io': "~2.2",
    'google.com/glog': "^0.7",
    'libevent.org': "*",
    'lz4.org': '1',
    'openssl.org': "^1.1",
    'tukaani.org/xz': '5',
    'facebook.com/zstd': '1',
    'gnu.org/coreutils': '9',
    'google.github.io/snappy': "*",
    'google.com/double-conversion': "^3",
    'google.com/googletest': "^1",
    'fmt.dev': "^12",
    'zlib.net': "^1",
    'github.com/fastfloat/fast_float': '7',
    darwin: {
      'sourceware.org/bzip2': "*",
    },
    linux: {
      'libcxx.llvm.org': "^18",
      'jemalloc.net': "^5",
      'elfutils.org': "^0",
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  buildDependencies: {
    'cmake.org': "^3.0.2",
    linux: {
      'gnu.org/gcc': '14',
    },
    'linux/aarch64': {
      'curl.se': "*",
      'gnu.org/patch': "*",
    },
  },
  distributable: {
    url: "https://github.com/facebook/folly/releases/download/{{version.tag}}/folly-{{version.tag}}.tar.gz",
    stripComponents: 0,
  },
  build: {
    script: [
      {
        run: "if test \"{{hw.platform}}/{{hw.arch}}\" = \"linux/aarch64\"; then\n  curl -LS https://github.com/facebook/folly/commit/93525a1b4c395e6afc2fb1c0019f8537916dd4c3.patch | patch -R -p1\n  curl -LS https://github.com/facebook/folly/commit/5dccf473579645f2b022bd9eeb6c7a42ea1eb1cb.patch | patch -R -p1 || true\nfi\n",
        if: ">=2024.07<2024.07.15",
      },
      {
        run: "if test \"{{hw.platform}}/{{hw.arch}}\" = \"linux/aarch64\"; then\n  sed -i '/NAME memcpy_aarch64-use/,/^)/d; /NAME memset_aarch64-use/,/^)/d' folly/external/aor/CMakeLists.txt\n  sed -i '/^folly_add_library($/{ N; /\\n$/d; }' folly/external/aor/CMakeLists.txt\nfi\n",
        if: ">=2026.1.19",
      },
      {
        run: "sed -i -f $PROP Checksum.cpp",
        if: ">=2024.08",
        'working-directory': "folly/hash",
      },
      "sed -i '/linux\\.cpp/d' folly/system/os/CMakeLists.txt",
      "cmake $ARGS -DBUILD_SHARED_LIBS=ON -S . -B shared",
      "cmake --build shared",
      "cmake --install shared",
      "cmake $ARGS -DBUILD_SHARED_LIBS=OFF -S . -B static",
      "cmake --build static",
      {
        run: "cp $SRCROOT/static/libfolly.a libfollybenchmark.a",
        'working-directory': "${{prefix}}/static/folly",
      },
      {
        run: "sed -i -E -e \"s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g\" -e '/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/include|/v\\1/include|g' -e '/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/lib|/v\\1/lib|g' folly-targets.cmake",
        'working-directory': "${{prefix}}/lib/cmake/folly",
      },
      {
        run: "sed -i -e 's/-I[^ ]* *//g' -e 's:{{pkgx.prefix}}:\\${prefix}/../../..:g' libfolly.pc",
        'working-directory': "${{prefix}}/lib/pkgconfig",
      },
      {
        run: "for LIB in libfolly*.*.*.*-dev.dylib; do\n  install_name_tool -add_rpath @loader_path $LIB\ndone\n",
        if: "darwin",
        'working-directory': "${{prefix}}/lib",
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DBUILD_TESTING=OFF",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-DFOLLY_USE_JEMALLOC=OFF",
        "-DCMAKE_CXX_STANDARD=20",
      ],
      'linux/aarch64': {
        ARGS: [
          "-DCMAKE_LIBRARY_ARCHITECTURE=aarch64",
          "-DCMAKE_C_FLAGS=-fPIC",
          "-DCMAKE_CXX_FLAGS=-fPIC",
        ],
      },
      linux: {
        ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie,-lrt,-lunwind",
        ],
      },
    },
  },
  test: {
    script: [
      "c++ -std=c++20 -DGLOG_USE_GLOG_EXPORT $FIXTURE -lfolly -ldl -lfmt -lglog",
      "./a.out",
    ],
  },
}
