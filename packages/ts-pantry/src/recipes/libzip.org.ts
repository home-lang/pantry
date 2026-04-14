import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libzip.org',
  name: 'zip',
  description: 'A C library for reading, creating, and modifying zip archives.',
  homepage: 'https://libzip.org/',
  github: 'https://github.com/nih-at/libzip',
  programs: ['zipcmp', 'zipmerge', 'ziptool'],
  versionSource: {
    type: 'github-releases',
    repo: 'nih-at/libzip',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/nih-at/libzip/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'facebook.com/zstd': '>=1.5.0',
  },
  buildDependencies: {
    'cmake.org': '>=3.24',
  },

  build: {
    script: [
      'cmake . $ARGS',
      'cmake --build .',
      'cmake --install .',
      '',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DBUILD_REGRESS=OFF', '-DBUILD_EXAMPLES=OFF', '-DENABLE_GNUTLS=OFF', '-DENABLE_MBEDTLS=OFF'],
    },
  },
}
