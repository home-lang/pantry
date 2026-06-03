import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/axllent/mailpit',
  name: 'mailpit',
  programs: [],
  dependencies: {
    linux: {
      'curl.se/ca-certs': '*',
    },
  },
  buildDependencies: {
    'nodejs.org': '<21',
    'npmjs.com': '*',
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/axllent/mailpit/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'npm install',
      'npm run build',
      'go build $GO_ARGS -ldflags="$LD_FLAGS"',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/mailpit',
      ],
      linux: {
        LD_FLAGS: [
          '-buildmode=pie',
        ],
      },
      LD_FLAGS: [
        '-s',
        '-w',
        '-X github.com/axllent/mailpit/config.Version={{version}}',
      ],
    },
  },
  test: {
    script: [
      'mailpit version --no-release-check | tee out',
      'grep {{version}} out',
    ],
  },
}
