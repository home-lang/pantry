import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'srtalliance.org',
  name: 'srt',
  description: 'Secure, Reliable, Transport',
  homepage: 'https://www.srtalliance.org/',
  github: 'https://github.com/Haivision/srt',
  programs: ['srt-ffplay', 'srt-file-transmit', 'srt-live-transmit', 'srt-tunnel'],
  versionSource: {
    type: 'github-releases',
    repo: 'Haivision/srt',
  },
  distributable: {
    url: 'https://github.com/Haivision/srt/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'cmake . $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['-DWITH_OPENSSL_INCLUDEDIR={{deps.openssl.prefix}}/include', '-DWITH_OPENSSL_LIBDIR={{deps.openssl.prefix}}/lib', '-DCMAKE_INSTALL_BINDIR=bin', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_INSTALL_INCLUDEDIR=include', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
    },
  },
}
