import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tailscale.com',
  name: 'tailscale',
  programs: ['tailscale', 'tailscaled'],
  versionSource: {
    type: 'github-releases',
    repo: 'tailscale/tailscale',
  },
  distributable: {
    url: 'https://github.com/tailscale/tailscale/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.25.1',
  },

  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{prefix}}"/bin/tailscale ./cmd/tailscale',
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{prefix}}"/bin/tailscaled ./cmd/tailscaled',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X tailscale.com/version.longStamp={{version}}-pkgx', '-X tailscale.com/version.shortStamp={{version}}', '-X tailscale.com/version.gitCommitStamp=pkgx'],
    },
  },
}
