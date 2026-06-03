import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kubernetes-sigs/aws-iam-authenticator',
  name: 'aws-iam-authenticator',
  programs: [
    'aws-iam-authenticator',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/kubernetes-sigs/aws-iam-authenticator/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LDFLAGS" ./cmd/aws-iam-authenticator',
    ],
    env: {
      GO_ARGS: [
        '-v',
        '-trimpath',
        '-o="{{prefix}}/bin/aws-iam-authenticator"',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X sigs.k8s.io/aws-iam-authenticator/pkg.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'aws-iam-authenticator version',
      'aws-iam-authenticator version | grep {{version}}',
      'aws-iam-authenticator init -i test',
      'cat key.pem | grep "BEGIN RSA PRIVATE KEY"',
      'cat cert.pem | grep "BEGIN CERTIFICATE"',
    ],
  },
}
