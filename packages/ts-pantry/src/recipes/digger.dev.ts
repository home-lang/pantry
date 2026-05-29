import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'digger.dev',
  name: 'digger',
  description: 'Digger is an open source IaC orchestration tool. Digger allows you to run IaC in your existing CI pipeline ⚡️  ',
  homepage: 'https://digger.dev',
  github: 'https://github.com/diggerhq/digger',
  programs: ['digger'],
  versionSource: {
    type: 'github-releases',
    repo: 'diggerhq/digger',
  },
  distributable: {
    url: 'https://github.com/diggerhq/digger/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      { run: 'cd cli', if: '>=0.3.2' },
      'go mod download',
      // 0.4.24 is missing a dep: https://github.com/diggerhq/digger/issues/1440
      { run: 'go get github.com/caarlos0/env/v8', if: '>=0.4.24' },
      // Fix merged but not released https://github.com/diggerhq/digger/issues/581
      {
        run: [
          'sed -i.bak -e \'s/^const version =/var version =/\' version.go',
          'rm version.go.bak',
        ],
        'working-directory': 'pkg/utils',
        if: '<0.3.2',
      },
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/digger',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/digger',
      'LDFLAGS': ['-s', '-w', '-X digger/pkg/utils.version={{version}}', '-X github.com/diggerhq/digger/pkg/utils.version={{version}}', '-X github.com/diggerhq/digger/cli/pkg/utils.version={{version}}'],
      // or segmentation fault on linux (array values supplement the base LDFLAGS)
      // https://github.com/docker-library/golang/issues/402#issuecomment-982204575
      'linux': {
        LDFLAGS: ['-buildmode=pie'],
      },
    },
  },
}
