import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gitlab.com/greut/eclint',
  name: 'eclint',
  programs: [
    'eclint',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://gitlab.com/greut/eclint/-/archive/v{{version}}/eclint-v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p {{prefix}}/bin',
      'go build -trimpath -ldflags="$LDFLAGS" -o {{ prefix }}/bin/eclint ./cmd/eclint',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version=v{{version}}',
      ],
      CGO_ENABLED: 0,
    },
  },
  test: {
    script: [
      'eclint -version | grep "v{{version}}"',
    ],
  },
}
