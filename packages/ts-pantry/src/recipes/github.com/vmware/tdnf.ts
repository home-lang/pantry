import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/vmware/tdnf',
  name: 'tdnf',
  programs: [
    'tdnf',
  ],
  dependencies: {
    'rpm.org/rpm': '*',
    'libexpat.github.io': '*',
    'sqlite.org': '3',
    'opensuse.org/libsolv': '*',
    'gnupg.org/gpgme': '*',
    'gnupg.org/libgpg-error': '*',
    // pkgx pinned ~1.1 (it shipped openssl 1.1); this pantry's openssl.org only
    // provides the 3.x line (quictls/openssl), and tdnf's CMake uses an
    // unversioned find_package(OpenSSL REQUIRED) that builds fine against 3.x —
    // matching the openssl '*' already pulled in transitively by rpm.org/rpm.
    'openssl.org': '*',
    'curl.se': '*',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },
  // rpm doesn't support darwin, and patching is a nightmare.
  platforms: ['linux'],
  distributable: {
    url: 'https://github.com/vmware/tdnf/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        // tdnf hardcodes /etc paths, patch to use CMAKE_INSTALL_PREFIX
        run: 'sed -i -f $PROP ../CMakeLists.txt',
        prop: {
          content: [
            's|set(CMAKE_INSTALL_FULL_SYSCONDIR "/etc")|set(CMAKE_INSTALL_FULL_SYSCONDIR "${CMAKE_INSTALL_PREFIX}/etc")|',
            's|set(SYSCONFDIR /etc)|set(SYSCONFDIR "${CMAKE_INSTALL_PREFIX}/etc")|',
            's|set(MOTGEN_DIR /etc/motdgen.d)|set(MOTGEN_DIR "${CMAKE_INSTALL_PREFIX}/etc/motdgen.d")|',
          ],
        },
      },
      'mkdir -p {{prefix}}/etc {{prefix}}/var/lib/tdnf',
      'cmake .. $CMAKE_ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_EXE_LINKER_FLAGS=-ldl',
        '-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-ldl,-lssl,-lcrypto',
        '-DSYSTEMD_DIR={{prefix}}/lib/systemd/system',
        '-DHISTORY_DB_DIR={{prefix}}/var/lib/tdnf',
      ],
    },
  },
}
