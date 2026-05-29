import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'atlasgo.io',
  name: 'atlas',
  description: 'Manage your database schema as code',
  homepage: 'https://atlasgo.io',
  github: 'https://github.com/ariga/atlas',
  programs: ['atlas'],
  versionSource: {
    type: 'github-releases',
    repo: 'ariga/atlas',
  },
  distributable: {
    url: 'https://github.com/ariga/atlas/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.24',
  },

  build: {
    workingDirectory: 'cmd/atlas',
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/atlas .',
    ],
    env: {
      'GO111MODULE': 'on',
      'GO_LDFLAGS': ['-s', '-w', '-X ariga.io/atlas/cmd/atlas/internal/cmdapi.version=v{{version}}'],
      // linux: or segmentation fault — https://github.com/docker-library/golang/issues/402#issuecomment-982204575
      'linux': {
        GO_LDFLAGS: ['-s', '-w', '-X ariga.io/atlas/cmd/atlas/internal/cmdapi.version=v{{version}}', '-buildmode=pie'],
      },
    },
  },
}
