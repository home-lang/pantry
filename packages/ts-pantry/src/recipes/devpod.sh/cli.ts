import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'devpod.sh/cli',
  name: 'cli',
  programs: [
    'devpod',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/loft-sh/devpod/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/devpod',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X=github.com/loft-sh/devpod/pkg/version.version="v{{version}}"',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
