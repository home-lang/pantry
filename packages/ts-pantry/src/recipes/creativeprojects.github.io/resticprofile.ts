import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'creativeprojects.github.io/resticprofile',
  name: 'resticprofile',
  programs: [
    'resticprofile',
  ],
  buildDependencies: {
    'go.dev': '~1.22',
  },
  distributable: {
    url: 'https://github.com/creativeprojects/resticprofile/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/resticprofile\' .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.commit=pantry',
        '-X main.date=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
        '-X main.buildBy=pkgx',
        '-X main.version={{version}}',
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
      'test "$(resticprofile version)" = "resticprofile version {{version}} commit pantry"',
      'resticprofile -c $FIXTURE show | grep \'local:/backup\'',
    ],
  },
}
