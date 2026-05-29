import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tilt.dev',
  name: 'tilt',
  description: 'Define your dev environment as code. For microservice apps on Kubernetes.',
  homepage: 'https://tilt.dev/',
  github: 'https://github.com/tilt-dev/tilt',
  programs: ['tilt'],
  versionSource: {
    type: 'github-releases',
    repo: 'tilt-dev/tilt',
  },
  distributable: {
    url: 'https://github.com/tilt-dev/tilt/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.25.5', // per go.mod
    'nodejs.org': '^20',
    'classic.yarnpkg.com': '*',
    'linux/aarch64': {
      'gnu.org/gcc': '*', // cgo _really_ wants g++/ld.gold
      'gnu.org/binutils': '~2.44', // ld.gold is deprecated
    },
  },

  build: {
    script: [
      'make build-js',
      'mkdir -p "{{prefix}}"/bin',
      'go build -v -trimpath -mod=vendor -ldflags="$GO_LDFLAGS" -o "{{prefix}}/bin/tilt" ./cmd/tilt',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '1',
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
      'linux': {
        // or segmentation fault
        // fix found here https://github.com/docker-library/golang/issues/402#issuecomment-982204575
        GO_LDFLAGS: ['-buildmode=pie'],
      },
    },
  },
}
