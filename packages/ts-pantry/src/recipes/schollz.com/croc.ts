import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'schollz.com/croc',
  name: 'croc',
  programs: [
    'croc',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/schollz/croc/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS"',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/croc',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/schollz/croc/v{{version.major}}/src/cli.Version={{version}}',
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
      'croc --version',
      'croc --version | grep {{version}}',
    ],
  },
}
