import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/loq9/go-sponge',
  name: 'go-sponge',
  programs: [
    'go-sponge',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/LOQ9/go-sponge/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o "{{ prefix }}"/bin/go-sponge',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
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
      'jq --null-input \\',
      '   \'type|if "null" then {A:3} else .+={A:3} end\' db.json \\',
      '| go-sponge db.json',
      'cat db.json',
    ],
  },
}
