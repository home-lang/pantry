import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ko.build',
  name: 'ko',
  description: 'Build and deploy Go applications on Kubernetes',
  homepage: 'https://ko.build',
  github: 'https://github.com/ko-build/ko',
  programs: ['ko'],
  versionSource: {
    type: 'github-releases',
    repo: 'ko-build/ko',
  },
  distributable: {
    url: 'https://github.com/ko-build/ko/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.22',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/ko\' .',
    ],
    env: {
      'GO111MODULE': 'on',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/google/ko/pkg/commands.Version={{version}}'],
    },
  },
}
