import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aquasecurity.github.io/trivy',
  name: 'trivy',
  programs: [
    'trivy',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '=1.25',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/binutils': '~2.44',
    },
  },
  distributable: {
    url: 'git+https://github.com/aquasecurity/trivy.git',
  },
  build: {
    script: [
      {
        run: 'export GOEXPERIMENT=jsonv2',
        if: '>=0.67.0',
      },
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/trivy',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/trivy',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/aquasecurity/trivy/pkg/version.ver={{version}}',
        '-X github.com/aquasecurity/trivy/pkg/version/app.ver={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'trivy image alpine:3.10',
      'trivy --version | grep {{version}}',
    ],
  },
}
