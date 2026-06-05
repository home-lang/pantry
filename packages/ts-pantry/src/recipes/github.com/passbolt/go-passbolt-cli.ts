import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/passbolt/go-passbolt-cli',
  name: 'go-passbolt-cli',
  programs: [
    'passbolt',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/passbolt/go-passbolt-cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o {{ prefix }}/bin/passbolt',
    ],
    env: {
      CGO_ENABLED: '0',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{ version }}',
        '-X main.date=$( date -u +\'%Y-%m-%dT%H:%M:%SZ\' )',
        '-X main.commit=$( git rev-parse HEAD )',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
