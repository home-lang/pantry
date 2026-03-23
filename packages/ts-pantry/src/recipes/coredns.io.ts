import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'coredns.io',
  name: 'coredns',
  description: 'CoreDNS is a DNS server that chains plugins',
  homepage: 'https://coredns.io/',
  github: 'https://github.com/coredns/coredns',
  programs: ['coredns'],
  versionSource: {
    type: 'github-releases',
    repo: 'coredns/coredns',
  },
  distributable: {
    url: 'https://github.com/coredns/coredns/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.24.0',
  },

  build: {
    script: [
      'go build -ldflags "$GO_LDFLAGS" -o {{ prefix }}/bin/coredns',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X main.Version={{version}}', '-X github.com/coredns/coredns/coremain.GitCommit=pkgx'],
    },
  },
}
