import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zeromq.org',
  name: 'zeromq',
  description: 'ZeroMQ core engine in C++, implements ZMTP/3.1',
  homepage: 'https://www.zeromq.org',
  github: 'https://github.com/zeromq/libzmq',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'zeromq/libzmq',
  },
  distributable: {
    url: 'https://github.com/zeromq/libzmq/releases/download/v{{version}}/zeromq-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--disable-Werror', '--disable-debug', '--prefix={{prefix}}', '--without-docs', '--disable-curve'],
    },
  },
}
