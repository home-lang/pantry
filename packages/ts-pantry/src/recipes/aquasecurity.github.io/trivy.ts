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
      // Trivy 0.66.0+ imports encoding/json/v2 (and encoding/json/jsontext),
      // which are gated behind GOEXPERIMENT=jsonv2 in Go 1.25/1.26. Without it
      // the build fails with "build constraints exclude all Go files in
      // .../encoding/json/v2". Inline the export with the build command so it
      // applies to the go invocation regardless of step isolation. (Earlier
      // the guard was >=0.67.0, which missed 0.66.0.)
      {
        run: 'GOEXPERIMENT=jsonv2 go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/trivy',
        if: '>=0.66.0',
      },
      {
        run: 'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/trivy',
        if: '<0.66.0',
      },
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
