import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/nishanths/license',
  name: 'license',
  programs: [
    'license',
  ],
  buildDependencies: {
    'go.dev': '^1.16',
  },
  distributable: {
    url: 'https://github.com/nishanths/license/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'GOBIN={{prefix}}/bin go install -ldflags="$LDFLAGS" .',
    ],
    env: {
      LDFLAGS: [
        '-X=main.version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'license -year 1997 mit > LICENSE',
      'test "$(cat LICENSE)" = "$(cat $FIXTURE)"',
    ],
  },
}
