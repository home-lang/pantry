import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'facebook.com/mvfst',
  name: 'mvfst',
  programs: [],
  dependencies: {
    'boost.org': '*',
    'github.com/facebookincubator/fizz': '*',
    'fmt.dev': '^12',
    'facebook.com/folly': '*',
    'gflags.github.io': '*',
    'google.com/glog': '*',
    'openssl.org': '*',
    linux: {
      'libsodium.org': '^1.0.19',
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  buildDependencies: {
    'cmake.org': '*',
    linux: {
      'gnu.org/gcc': '14',
      'gnu.org/binutils': '*',
      'gnu.org/make': '*',
      'kernel.org/linux-headers': '*',
    },
  },
  distributable: {
    url: 'https://github.com/facebook/mvfst/archive/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'export PATH={{deps.gnu.org/binutils.prefix}}/bin:$PATH',
        if: 'linux',
      },
      {
        run: 'patch -p1 <$PROP',
        if: '<2024.10.14.0',
        prop: {
          content: [
            'diff --git a/quic/api/CMakeLists.txt b/quic/api/CMakeLists.txt',
            'index 5522347c5..a0a34761e 100644',
            '--- a/quic/api/CMakeLists.txt',
            '+++ b/quic/api/CMakeLists.txt',
            '@@ -47,6 +47,7 @@ add_library(',
            '   QuicPacketScheduler.cpp',
            '   QuicStreamAsyncTransport.cpp',
            '   QuicTransportBase.cpp',
            '+  QuicTransportBaseLite.cpp',
            '   QuicTransportFunctions.cpp',
            ' )',
            '',
            'diff --git a/quic/state/CMakeLists.txt b/quic/state/CMakeLists.txt',
            'index 0916546fe..14297bb30 100644',
            '--- a/quic/state/CMakeLists.txt',
            '+++ b/quic/state/CMakeLists.txt',
            '@@ -55,6 +55,7 @@ add_library(',
            '   mvfst_state_ack_handler',
            '   AckEvent.cpp',
            '   AckHandlers.cpp',
            '+  AckedPacketIterator.cpp',
            ' )',
            '',
            ' set_property(TARGET mvfst_state_ack_handler PROPERTY VERSION ${PACKAGE_VERSION})',
          ],
        },
      },
      'cmake -S . -B _build $CMAKE_ARGS',
      'cmake --build _build',
      'cmake --install _build',
      {
        run: 'sed -i -e "s:{{pkgx.prefix}}:\\$\\{_IMPORT_PREFIX\\}/../../..:g" mvfst-targets.cmake',
        'working-directory': '${{prefix}}/lib/cmake/mvfst',
      },
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DBUILD_TESTS=OFF',
        '-DCMAKE_POSITION_INDEPENDENT_CODE=ON',
      ],
      linux: {
        CC: 'gcc',
        CXX: 'g++',
        LD: 'g++',
        CMAKE_ARGS: [
          '-DCMAKE_CXX_FLAGS=-fPIC',
          '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie',
        ],
      },
    },
  },
  test: {
    script: [
      'export PATH={{deps.gnu.org/binutils.prefix}}/bin:$PATH',
      'PADDED_VERSION=$(echo "{{version}}" | gawk -F. \'{printf "%04d.%02d.%02d.%02d\\n", $1, $2, $3, $4}\')',
      'curl -L "https://github.com/facebook/mvfst/archive/v$PADDED_VERSION.tar.gz" | tar -xz --strip-components=1',
      'cmake .',
      'cmake --build .',
    ],
  },
}
