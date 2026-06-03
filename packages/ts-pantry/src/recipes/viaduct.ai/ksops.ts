import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'viaduct.ai/ksops',
  name: 'ksops',
  programs: [
    'ksops',
  ],
  buildDependencies: {
    'go.dev': '~1.22',
  },
  distributable: {
    url: 'https://github.com/viaduct-ai/kustomize-sops/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/ksops',
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
      'ksops $FIXTURE >out.yaml',
    ],
  },
}
