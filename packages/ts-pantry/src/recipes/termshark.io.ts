import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'termshark.io',
  name: 'termshark',
  programs: ['termshark'],
  versionSource: {
    type: 'github-releases',
    repo: 'gcla/termshark',
  },
  distributable: {
    url: 'https://github.com/gcla/termshark/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'wireshark.org': '*',
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go build ${GO_ARGS} -v -ldflags="${GO_LDFLAGS}" ./cmd/termshark',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_ARGS': '-o "{{prefix}}/bin/"',
      'GO_LDFLAGS': ['-s', '-w'],
    },
  },
}
