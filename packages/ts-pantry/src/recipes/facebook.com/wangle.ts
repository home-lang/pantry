import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "facebook.com/wangle",
  name: "wangle",
  programs: [],
  dependencies: {
    'boost.org': "*",
    'google.com/double-conversion': "^3",
    'github.com/facebookincubator/fizz': "*",
    'fmt.dev': "^12",
    'facebook.com/folly': "*",
    'gflags.github.io': "*",
    'google.com/glog': "^0.7",
    'libevent.org': "*",
    'libsodium.org': "*",
    'lz4.org': "^1",
    'openssl.org': "^1.1",
    'google.github.io/snappy': "*",
    'facebook.com/zstd': "^1",
    darwin: {
      'sourceware.org/bzip2': "*",
      'zlib.net': "*",
    },
    linux: {
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'cmake.org': "^3",
    linux: {
      'gnu.org/gcc': 14,
    },
  },
  distributable: {
    url: "https://github.com/facebook/wangle/archive/refs/tags/v{{version.raw}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cmake . -DBUILD_SHARED_LIBS=ON $ARGS",
      "make install",
      "make clean",
      "cmake . -DBUILD_SHARED_LIBS=OFF $ARGS",
      "make",
      "cp lib/libwangle.a {{prefix}}/lib",
      {
        run: "sed -E -i.bak \\\n  -e \"s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g\" \\\n  -e '/^  INTERFACE_INCLUDE_DIRECTORIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/include|/v\\1/include|g' \\\n  -e '/^  INTERFACE_LINK_LIBRARIES/ s|/v([0-9]+)(\\.[0-9]+)*[a-z]?/lib|/v\\1/lib|g' \\\nwangle-targets.cmake\nrm wangle-targets.cmake.bak\n",
        'working-directory': {{prefix}}/lib/cmake/wangle,
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DBUILD_TESTS=OFF",
      ],
    },
  },
  test: {
    script: [
      "STD=c++17",
      "STD=c++20",
      "c++ -std=$STD -DGLOG_USE_GLOG_EXPORT 'EchoClient.cpp' -o EchoClient $LIBS",
      "c++ -std=$STD -DGLOG_USE_GLOG_EXPORT 'EchoServer.cpp' -o EchoServer $LIBS",
    ],
  },
}
