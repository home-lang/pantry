import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'coder.com',
  name: 'coder',
  description: 'Tool for provisioning self-hosted development environments with Terraform',
  homepage: 'https://coder.com',
  github: 'https://github.com/coder/coder',
  programs: ['coder'],
  versionSource: {
    type: 'github-releases',
    repo: 'coder/coder',
  },
  distributable: {
    url: 'git+https://github.com/coder/coder.git',
  },
  buildDependencies: {
    'go.dev': '~1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LD_FLAGS" ./cmd/coder',
    ],
    env: {
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/coder', '-tags slim'],
      'LD_FLAGS': ['-s', '-w', '-X github.com/coder/coder/v2/buildinfo.tag={{version}}', '-X github.com/coder/coder/v2/buildinfo.agpl=true'],
    },
  },
}
