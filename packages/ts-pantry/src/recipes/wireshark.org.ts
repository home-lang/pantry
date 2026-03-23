import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'wireshark.org',
  name: 'wireshark',
  description: 'Network analyzer and capture tool - without graphical user interface',
  homepage: 'https://www.wireshark.org',
  programs: ['capinfos', 'captype', 'dumpcap', 'editcap', 'idl2wrs', 'mergecap', 'mmdbresolve', 'randpkt', 'rawshark', 'reordercap', 'sharkd', 'text2pcap', 'tshark'],
  distributable: {
    url: 'https://www.wireshark.org/download/src/all-versions/wireshark-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/glib': '^2.78.3',
    'github.com/maxmind/libmaxminddb': '^1.8',
    'nghttp2.org': '^1.58',
    'libssh.org': '^0.10.5',
    'github.com/xiph/speexdsp': '^1.2.1',
    'tcpdump.org': '^1.10.4',
    'gnome.org/libxml2': '^2.12.3',
  },
  buildDependencies: {
    'cmake.org': '*',
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
    'python.org': '^3.11',
    'perl.org': '5',
  },

  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'cmake --install build --component Development',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_wireshark=OFF', '-DENABLE_GNUTLS=ON', '-DBUILD_wireshark_gtk=OFF', '-DENABLE_LUA=OFF', '-DENABLE_SMI=OFF', '-DBUILD_sshdump=ON', '-DBUILD_ciscodump=ON', '-DENABLE_NGHTTP2=ON', '-DENABLE_APPLICATION_BUNDLE=OFF', '-DCMAKE_INSTALL_NAME_DIR:STRING={{prefix}}/lib', '-DMAXMINDDB_INCLUDE_DIR={{deps.github.com/maxmind/libmaxminddb.prefix}}/include'],
    },
  },
}
