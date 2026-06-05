import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'khanacademy.org/genqlient',
  name: 'genqlient',
  programs: [
    'genqlient',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/Khan/genqlient/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // genqlient pins golang.org/x/tools v0.24.0 whose tokeninternal.go fails
      // to compile under modern Go ("invalid array length -delta * delta").
      // Bump x/tools to a Go 1.26-compatible release before building.
      'go get golang.org/x/tools@v0.38.0',
      'go mod tidy',
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: '0',
      BUILDLOC: '{{prefix}}/bin/genqlient',
      LDFLAGS: [
        '-s',
        '-w',
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
      'genqlient --help',
    ],
  },
}
