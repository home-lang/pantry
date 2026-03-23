import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
    'abseil.io': '^20250127',
    'c-ares.org': '*',
    'openssl.org': '^1.1',
    'github.com/google/re2': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'cmake.org': '^3',
    'freedesktop.org/pkg-config': '^0',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'cd "../.."',
      'git submodule update --init --recursive',
      'cd "../.."',
      'if test "{{hw.platform}}" = "darwin"; then',
      '  patch -i $PROP || true',
      'fi',
      '',
      'cmake $COMMON_ARGS $ARGS ../..',
      'make install',
      'cmake $COMMON_ARGS $CLI_ARGS ../..',
      'make grpc_cli',
      'cp grpc_cli "{{prefix}}/bin"',
      'cp libgrpc++_test_config.* "{{prefix}}/lib"',
      'cd "{{prefix}}"',
      'for f in bin/* lib/libgrpc++_test_config.dylib; do',
      '  if test -f $f && ! otool -l $f | grep @loader_path/../lib; then',
      '    install_name_tool -add_rpath @loader_path/../lib $f',
      '  fi',
      'done',
      '',
    ],
    env: {
      'COMMON_ARGS': ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_RPATH={{prefix}}', '-DBUILD_SHARED_LIBS=ON'],
      'ARGS': ['-DCMAKE_CXX_STANDARD=17', '-DCMAKE_CXX_STANDARD_REQUIRED=TRUE', '-DgRPC_BUILD_TESTS=OFF', '-DgRPC_INSTALL=ON', '-DgRPC_ABSL_PROVIDER=package', '-DgRPC_CARES_PROVIDER=package', '-DgRPC_SSL_PROVIDER=package', '-DgRPC_ZLIB_PROVIDER=package', '-DgRPC_RE2_PROVIDER=package', '-DgRPC_BUILD_GRPC_CSHARP_PLUGIN=OFF', '-DgRPC_BUILD_GRPC_NODE_PLUGIN=OFF', '-DgRPC_BUILD_GRPC_OBJECTIVE_C_PLUGIN=OFF', '-DgRPC_BUILD_GRPC_PHP_PLUGIN=OFF', '-DgRPC_BUILD_GRPC_RUBY_PLUGIN=OFF'],
      'CLI_ARGS': ['-DgRPC_BUILD_TESTS=ON'],
    },
  },
}
