import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libssh2.org',
  name: 'libssh2',
  description: 'the SSH library',
  homepage: 'https://libssh2.org/',
  github: 'https://github.com/libssh2/libssh2',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'libssh2/libssh2',
    tagPattern: /^libssh2-(.+)$/,
  },
  distributable: {
    url: 'https://www.libssh2.org/download/libssh2-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1.2',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--with-openssl', '--with-libz', '--disable-examples-build'],
    },
  },
}
