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
    'go.dev': '~1.21',
    'nodejs.org': '^20',
    'classic.yarnpkg.com': '*',
    'linux/aarch64': '[object Object]',
  },

  build: {
    script: [
      'make build-js',
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/tilt',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '1',
      'BUILDLOC': '{{prefix}}/bin/tilt',
      'LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
