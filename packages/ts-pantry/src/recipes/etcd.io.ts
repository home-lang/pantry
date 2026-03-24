import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'etcd.io',
  name: 'etcd',
  description: 'Distributed reliable key-value store for the most critical data of a distributed system',
  homepage: 'https://etcd.io',
  github: 'https://github.com/etcd-io/etcd',
  programs: ['etcd', 'etcdctl'],
  versionSource: {
    type: 'github-releases',
    repo: 'etcd-io/etcd',
  },
  distributable: {
    url: 'https://github.com/etcd-io/etcd/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.22',
  },

  build: {
    script: [
      'make',
      'mkdir -p {{prefix}}/bin',
      'cp bin/* {{prefix}}/bin',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w'],
      'ETCD_UNSUPPORTED_ARCH': 'arm64',
    },
  },
}
