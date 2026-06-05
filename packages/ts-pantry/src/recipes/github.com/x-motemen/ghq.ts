import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/x-motemen/ghq',
  name: 'ghq',
  programs: [
    'ghq',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'git+https://github.com/x-motemen/ghq',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      CGO_ENABLED: '0',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.revision=$(git rev-parse --short HEAD)',
      ],
      BUILDLOC: '{{prefix}}/bin/ghq',
    },
  },
  test: {
    script: [
      'test "$(ghq --version | grep -E \'^ghq version {{version}}\')"',
    ],
  },
}
