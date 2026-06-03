import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/blacktop/lporg',
  name: 'lporg',
  programs: [
    'lporg',
  ],
  buildDependencies: {
    'go.dev': '~1.21',
  },
  distributable: {
    url: 'https://github.com/blacktop/lporg/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o \'{{prefix}}/bin/lporg\' .',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/blacktop/lporg/cmd.AppVersion={{version}}',
        '-X github.com/blacktop/lporg/cmd.AppBuildTime=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
      ],
    },
  },
  test: {
    script: [
      'lporg version | grep "Version: {{version}}"',
    ],
  },
}
