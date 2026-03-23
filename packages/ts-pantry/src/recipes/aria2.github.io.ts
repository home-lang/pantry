import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'aria2.github.io',
  name: 'aria2c',
  description: 'aria2 is a lightweight multi-protocol & multi-source, cross platform download utility operated in command-line. It supports HTTP/HTTPS, FTP, SFTP, BitTorrent and Metalink.',
  homepage: 'https://aria2.github.io/',
  github: 'https://github.com/aria2/aria2',
  programs: ['aria2c'],
  versionSource: {
    type: 'github-releases',
    repo: 'aria2/aria2/releases',
    tagPattern: /\/^aria2 \//,
  },
  distributable: {
    url: 'https://github.com/aria2/aria2/releases/download/release-{{ version }}/aria2-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'openssl.org': '^1',
    'libexpat.github.io': '*',
    'sqlite.org': '^3',
  },
  buildDependencies: {
    'gnupg.org/libgcrypt': '^1',
    'gnupg.org/libgpg-error': '^1',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--with-openssl', '--with-libgcrypt'],
    },
  },
}
