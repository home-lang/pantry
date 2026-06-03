import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/protobuf.dev',
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
    url: 'https://github.com/protocolbuffers/protobuf/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    // match build version. lame, i know. but the bins get wrappers to automate.
    'abseil.io': '*',
    'pkgx.sh': '>=1', // for the shims
    linux: {
      'gnu.org/binutils': '*', // readelf
      'gnu.org/sed': '*',
    },
  },
  buildDependencies: {
    'cmake.org': '^3',
    'abseil.io': '^20250127',
  },

  build: {
    'working-directory': 'build',
    workingDirectory: 'build',
    script: [
      // cmake really doesn't like this with new xcode
      { run: 'sed -i \'/libprotobuf PRIVATE atomic/s/^/#/\' protobuf-configure-target.cmake', 'working-directory': '../cmake', if: 'darwin' },
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}} install',
      // wrapper script resolves the correct abseil.io version at runtime
      'install -d {{prefix}}/libexec',
      {
        run: [
          'for BIN in *; do',
          '  mv $BIN ../libexec/$BIN',
          '  install -m755 $SRCROOT/props/protoc.{{hw.platform}} $BIN',
          'done',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      linux: {
        // likely needs bumping to an unreleased abseil.io version
        // ld.lld: error: undefined reference due to --no-allow-shlib-undefined
        LDFLAGS: '$LDFLAGS -Wl,--allow-shlib-undefined',
      },
      ARGS: [
        '-Dprotobuf_BUILD_LIBPROTOC=ON',
        '-Dprotobuf_BUILD_SHARED_LIBS=ON',
        '-Dprotobuf_INSTALL_EXAMPLES=OFF',
        '-Dprotobuf_BUILD_TESTS=OFF',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-Dprotobuf_ABSL_PROVIDER=package',
        '-DCMAKE_PREFIX_PATH={{deps.abseil.io.prefix}}',
        // as of 32
        '-Dprotobuf_FORCE_FETCH_DEPENDENCIES=OFF',
        '-Dprotobuf_LOCAL_DEPENDENCIES_ONLY=ON',
      ],
    },
  },
}
