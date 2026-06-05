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
    'openssl.org': '~1.1',
    'curl.se': '*',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/vmware/tdnf/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      {
        run: 'sed -i -f $PROP ../CMakeLists.txt',
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
