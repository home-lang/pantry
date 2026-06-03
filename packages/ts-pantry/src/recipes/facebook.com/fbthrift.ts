import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "facebook.com/fbthrift",
  name: "fbthrift",
  programs: [
    "thrift1",
  ],
  dependencies: {
    'github.com/facebookincubator/fizz': "*",
    'facebook.com/folly': "*",
    'facebook.com/wangle': "*",
    'fmt.dev': "^12",
    'gflags.github.io': "^2.2.2",
    'google.com/glog': "^0.7",
    'openssl.org': "^1.1",
    'boost.org': "^1.83",
    'facebook.com/zstd': "^1.5.5",
    'zlib.net': "^1.3",
    'libsodium.org': "^1.0.19",
    'github.com/Cyan4973/xxHash': "^0.8",
    linux: {
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'cmake.org': "*",
    'facebook.com/mvfst': "*",
    'gnu.org/bison': "*",
    'github.com/westes/flex': "*",
    'python.org': "^3.10",
    linux: {
      'gnu.org/gcc': 14,
      'gnu.org/binutils': "*",
    },
  },
  distributable: {
    url: "https://github.com/facebook/fbthrift/archive/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i 's/^static_assert(is_supported_integral_type<char>);/\\/\\/&/' object.h",
        if: "linux/aarch64",
        'working-directory': "thrift/compiler/whisker",
      },
      {
        run: "if test -f FindFmt.cmake; then\n  sed -i 's/add_library(fmt::fmt UNKNOWN IMPORTED)/#&/' FindFmt.cmake\nfi\n",
        if: "darwin",
        'working-directory': "thrift/cmake",
      },
      {
        run: "sed -i -f $PROP RoundRobinRequestPile.h",
        'working-directory': "thrift/lib/cpp2/server",
      },
      {
        run: "export PATH={{deps.gnu.org/binutils.prefix}}/bin:$PATH",
        if: "linux",
      },
      "cmake -S . $CMAKE_ARGS",
      "cmake --build .",
      "cmake --install .",
      {
        run: "sed -i -E -e \"s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g\" -e '/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/include|/v\\1/include|g' -e '/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/lib|/v\\1/lib|g' FBThriftTargets.cmake",
        'working-directory': "${{prefix}}/lib/cmake/fbthrift",
      },
    ],
    env: {
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX=\{{prefix}},
        "-DCMAKE_INSTALL_LIBDIR=lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_FIND_FRAMEWORK=LAST",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
        "-DBUILD_TESTING=OFF",
        "-DBUILD_SHARED_LIBS=OFF",
        "-DCMAKE_CXX_STANDARD=20",
      ],
      linux: {
        CC: "gcc",
        CXX: "g++",
        LD: "gcc",
        CMAKE_ARGS: [
          "-DCMAKE_C_FLAGS=-fPIC",
          "-DCMAKE_CXX_FLAGS=-fPIC",
          "-DCMAKE_EXE_LINKER_FLAGS=-pie",
        ],
      },
      darwin: {
        CXXFLAGS: [
          "-fno-assume-unique-vtables",
        ],
        CMAKE_ARGS: [
          "-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-undefined,dynamic_lookup,-dead_strip_dylibs",
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,-dead_strip_dylibs",
        ],
      },
    },
  },
  test: {
    script: [
      "if [ -f /etc/os-release ] && grep -q '^ID=arch' /etc/os-release; then\n  echo \"Arch Linux detected! Not currently testable.\"\n  exit 0\nfi\n",
      "thrift1 --gen mstch_cpp2 example.thrift",
      "ls | grep gen-cpp2",
    ],
  },
}
