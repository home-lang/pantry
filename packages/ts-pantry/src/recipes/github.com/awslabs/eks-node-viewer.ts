import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/awslabs/eks-node-viewer',
  name: 'eks-node-viewer',
  programs: [
    'eks-node-viewer',
  ],
  buildDependencies: {
    'go.dev': '~1.24.2',
  },
  distributable: {
    url: 'https://github.com/awslabs/eks-node-viewer/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/eks-node-viewer',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/eks-node-viewer',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version="{{ version }}"',
        '-X main.date="$( date --iso-8601=minutes )"',
        '-X main.builtBy="pkgx"',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
