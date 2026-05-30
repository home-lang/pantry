import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'grpc.io',
  name: 'grpc',
  description: 'The C based gRPC (C++, Python, Ruby, Objective-C, PHP, C#)',
  homepage: 'https://grpc.io/',
  github: 'https://github.com/grpc/grpc',
  programs: ['grpc_csharp_plugin', 'grpc_node_plugin', 'grpc_cpp_plugin', 'grpc_python_plugin', 'grpc_objective_c_plugin', 'grpc_ruby_plugin', 'grpc_php_plugin', 'grpc_cli'],
  versionSource: {
    type: 'github-releases',
    repo: 'grpc/grpc',
  },
  distributable: {
    url: 'git+https://github.com/grpc/grpc',
  },
  dependencies: {
    // grpc 1.81.0 vendors abseil 20250512.1 (third_party/abseil-cpp submodule +
    // bazel/grpc_deps.bzl). Newer abseil (e.g. 20260107.1) installs a CMake
    // package whose abslTargets.cmake references files grpc's
    // `find_package(absl REQUIRED CONFIG)` can't resolve ("not all the files it
    // references"), so pin to the vendored, known-good release. This still
    // satisfies protobuf.dev's abseil floor (^20250127).
    'abseil.io': '20250512.1',
    'c-ares.org': '*',
    'openssl.org': '^1.1',
    'github.com/google/re2': '*',
    'zlib.net': '*',
    // grpc links to specific versions, so we use theirs on linux
    'linux': {
      'gnu.org/gcc/libstdcxx': '14',
      'protobuf.dev': '30.0.0',
    },
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'cmake.org': '^3',
    'git-scm.org': '^2',
    // darwin needs GNU patch to apply the CMakeLists fix
    'darwin': {
      'gnu.org/patch': '*',
    },
  },

  build: {
    workingDirectory: 'cmake/build',
    script: [
      // The loader does not forward distributable.ref, so the git+ url clones
      // the default branch. Fetch and check out the requested release tag here
      // so submodules/build match {{version}}.
      {
        run: [
          'git fetch --depth 1 origin "tag" "v{{version}}" 2>/dev/null || git fetch origin "tag" "v{{version}}" || true',
          'git checkout "v{{version}}" 2>/dev/null || true',
          'git submodule update --init --recursive',
        ],
        'working-directory': '../..',
      },

      // darwin link fix: https://github.com/grpc/grpc/issues/36654
      {
        run: 'if test "{{hw.platform}}" = "darwin"; then\n  patch -i $PROP || true\nfi',
        if: '>=1.63<1.66.2',
        'working-directory': '../..',
        prop: {
          content: [
            '--- CMakeLists.txt.orig\t2024-05-16 01:01:03.000000000 +0000',
            '+++ CMakeLists.txt',
            '@@ -3682,6 +3682,7 @@ target_include_directories(upb_json_lib',
            ' )',
            ' target_link_libraries(upb_json_lib',
            '   ${_gRPC_ALLTARGETS_LIBRARIES}',
            '+  grpc++_unsecure',
            '   utf8_range_lib',
            '   upb_message_lib',
            ' )',
            '@@ -3883,6 +3884,7 @@ target_include_directories(upb_textforma',
            ' )',
            ' target_link_libraries(upb_textformat_lib',
            '   ${_gRPC_ALLTARGETS_LIBRARIES}',
            '+  grpc++_unsecure',
            '   utf8_range_lib',
            '   upb_message_lib',
            ' )',
            '',
          ].join('\n'),
        },
      },

      'cmake $COMMON_ARGS $ARGS ../..',
      'make install',

      // Build the cli — fails to build on linux, so darwin-only.
      {
        run: [
          'cmake $COMMON_ARGS $CLI_ARGS ../..',
          'make grpc_cli',
          'cp grpc_cli "{{prefix}}/bin"',
          'cp libgrpc++_test_config.* "{{prefix}}/lib"',
        ],
        if: 'darwin',
      },

      // grpc libs/binaries reference @rpath/libgrpc_plugin_support.*.dylib, so
      // add @loader_path to the rpath.
      {
        run: 'for f in bin/* lib/libgrpc++_test_config.dylib; do\n  if test -f $f && ! otool -l $f | grep @loader_path/../lib; then\n    install_name_tool -add_rpath @loader_path/../lib $f\n  fi\ndone',
        if: 'darwin',
        'working-directory': '{{prefix}}',
      },
    ],
    env: {
      COMMON_ARGS: ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_RPATH={{prefix}}', '-DBUILD_SHARED_LIBS=ON'],
      ARGS: ['-DCMAKE_CXX_STANDARD=17', '-DCMAKE_CXX_STANDARD_REQUIRED=TRUE', '-DgRPC_BUILD_TESTS=OFF', '-DgRPC_INSTALL=ON', '-DgRPC_ABSL_PROVIDER=package', '-DgRPC_CARES_PROVIDER=package', '-DgRPC_SSL_PROVIDER=package', '-DgRPC_ZLIB_PROVIDER=package', '-DgRPC_RE2_PROVIDER=package'],
      CLI_ARGS: ['-DgRPC_BUILD_TESTS=ON'],
      darwin: {
        ARGS: ['-DgRPC_PROTOBUF_PROVIDER=module', '-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-rpath,{{pkgx.prefix}},-undefined,dynamic_lookup'],
      },
      linux: {
        // linker complains about libstdc++ symbols, but they resolve at runtime
        ARGS: ['-DgRPC_PROTOBUF_PROVIDER=package', '-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-labsl_log_internal_message,-lstdc++,--allow-shlib-undefined', '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-labsl_log_internal_message,-lstdc++,--allow-shlib-undefined'],
      },
    },
  },
}
