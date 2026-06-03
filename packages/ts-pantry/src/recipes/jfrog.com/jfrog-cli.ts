import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jfrog.com/jfrog-cli',
  name: 'jfrog-cli',
  programs: [
    'jf',
    'jfrog',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/jfrog/jfrog-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod tidy',
      'go build -ldflags="$GO_LDFLAGS" $ARGS',
      {
        run: 'ln -s jf jfrog',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o {{prefix}}/bin/jf',
      ],
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
      'jf -v | grep {{version}}',
      'jfrog -v | grep {{version}}',
    ],
  },
}
