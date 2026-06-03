import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/spencerkimball/stargazers',
  name: 'stargazers',
  programs: [
    'stargazers',
  ],
  buildDependencies: {
    'go.dev': '^1.16.15',
  },
  distributable: {
    url: 'https://github.com/spencerkimball/stargazers/archive/85d187742259496f1ef3a22be966d0fbc831d916.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'test -f go.mod || go mod init github.com/spencerkimball/stargazers',
      'go mod tidy',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/stargazers\' .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
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
      'stargazers fetch --repo=jhheider/semverator --token=$GITHUB_TOKEN',
      'stargazers analyze --repo=jhheider/semverator',
    ],
  },
}
