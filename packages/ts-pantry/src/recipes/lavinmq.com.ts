import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lavinmq.com',
  name: 'lavinmq',
  description: 'Lightweight and fast AMQP (0-9-1) server',
  homepage: 'https://lavinmq.com',
  github: 'https://github.com/cloudamqp/lavinmq',
  programs: ['lavinmq', 'lavinmqctl', 'lavinmqperf'],
  platforms: ['darwin/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'cloudamqp/lavinmq',
  },
  distributable: {
    url: 'https://github.com/cloudamqp/lavinmq/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'pcre.org/v2': '10',
    'libevent.org': '2',
    'hboehm.info/gc': '8',
  },
  buildDependencies: {
    'lz4.org': '^1',
    'perl.org': '=5.42.0',
    'etcd.io': '*',
  },

  build: {
    script: [
      'sed -i.bak \'s/--link-flags=-pie/--link-flags=-Wl,-pie,-headerpad_max_install_names/\' Makefile',
      'sed -i.bak -f $PROP Makefile',
      'make -j {{hw.concurrency}} install $ARGS',
    ],
    env: {
      'ARGS': ['PREFIX="{{prefix}}"', 'SYSCONFDIR="{{prefix}}/etc"', 'SHAREDSTATEDIR="{{prefix}}/var"', 'UNITDIR="{{prefix}}/etc"', 'DOCS=', 'CRYSTAL_FLAGS=-Dbake_static'],
      'CRYSTAL_PATH': './lib:$CRYSTAL_PATH',
    },
  },
}
