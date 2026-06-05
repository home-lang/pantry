import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'trufflesecurity.com/trufflehog',
  name: 'trufflehog',
  programs: [
    'trufflehog',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/trufflesecurity/trufflehog/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/trufflehog',
    ],
    env: {
      CGO_ENABLED: '0',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X=github.com/trufflesecurity/trufflehog/v3/pkg/version.BuildVersion={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
