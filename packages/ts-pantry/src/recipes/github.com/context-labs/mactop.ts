import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/context-labs/mactop',
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  name: 'mactop',
  programs: [
    'mactop',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/context-labs/mactop/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      BUILDLOC: '{{prefix}}/bin/mactop',
      LDFLAGS: [
        '-s',
        '-w',
      ],
    },
  },
}
