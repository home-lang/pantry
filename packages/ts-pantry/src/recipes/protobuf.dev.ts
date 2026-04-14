import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'protobuf.dev',
  name: 'Protocol Buffers',
  description: 'Protocol Buffers - data interchange format',
  homepage: 'https://protobuf.dev/',
  github: 'https://github.com/protocolbuffers/protobuf',
  programs: ['protoc'],
  versionSource: {
    type: 'github-releases',
    repo: 'protocolbuffers/protobuf',
  },
  distributable: {
    url: 'https://github.com/protocolbuffers/protobuf/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'abseil.io': '*',
  },
  buildDependencies: {
    'cmake.org': '^3',
    'abseil.io': '^20250127',
  },

  build: {
    script: [
      'cd "../cmake"',
      'sed -i \'/libprotobuf PRIVATE atomic/s/^/#/\' protobuf-configure-target.cmake',
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['-Dprotobuf_BUILD_LIBPROTOC=ON', '-Dprotobuf_BUILD_SHARED_LIBS=ON', '-Dprotobuf_INSTALL_EXAMPLES=OFF', '-Dprotobuf_BUILD_TESTS=OFF', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-Dprotobuf_ABSL_PROVIDER=package', '-DCMAKE_PREFIX_PATH={{deps.abseil.io.prefix}}', '-Dprotobuf_FORCE_FETCH_DEPENDENCIES=OFF', '-Dprotobuf_LOCAL_DEPENDENCIES_ONLY=ON'],
    },
  },
}
