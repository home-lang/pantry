import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ipfs.tech',
  name: 'ipfs',
  description: 'Peer-to-peer hypermedia protocol',
  homepage: 'https://ipfs.tech/',
  github: 'https://github.com/ipfs/kubo',
  programs: ['ipfs'],
  versionSource: {
    type: 'github-releases',
    repo: 'ipfs/kubo',
  },
  distributable: {
    url: 'https://github.com/ipfs/kubo/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '>=1.20',
    'gnu.org/patch': '*',
  },

  build: {
    script: [
      'export GOFLAGS="-buildmode=pie"',
      'make build CGO_ENABLED=0',
      'mkdir -p {{prefix}}/bin',
      'mv cmd/ipfs/ipfs {{prefix}}/bin',
    ],
  },
}
