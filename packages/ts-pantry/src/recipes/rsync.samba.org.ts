import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rsync.samba.org',
  name: 'rsync',
  description: 'An open source utility that provides fast incremental file transfer. It also has useful features for backup and restore operations among many other use cases.',
  homepage: 'https://rsync.samba.org/',
  github: 'https://github.com/WayneD/rsync',
  programs: ['rsync', 'rsync-ssl'],
  versionSource: {
    type: 'github-releases',
    repo: 'WayneD/rsync',
  },
  distributable: {
    url: 'https://rsync.samba.org/ftp/rsync/rsync-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'facebook.com/zstd': '^1',
    'lz4.org': '^1',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--disable-debug', '--prefix={{prefix}}', '--with-rsyncd-conf={{prefix}}/rsyncd.conf', '--with-included-popt=yes', '--with-included-zlib=no', '--disable-openssl', '--enable-ipv6', '--disable-xxhash'],
    },
  },
}
