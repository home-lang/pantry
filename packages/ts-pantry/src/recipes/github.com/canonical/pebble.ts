import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/canonical/pebble',
  name: 'pebble',
  programs: [
    'pebble',
  ],
  platforms: ['linux'],
  buildDependencies: {
    'go.dev': '*',
    'git-scm.org': '*',
    'gnu.org/sed': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'git+https://github.com/canonical/pebble',
  },
  build: {
    script: [
      'go generate ./cmd',
      {
        run: 'sed -i \'s/Version = ".*"/Version = "v{{version}}"/\' version_generated.go',
        if: '<1.2',
        'working-directory': 'cmd',
      },
      'go build -v -ldflags="${LDFLAGS}" -o {{ prefix }}/bin/pebble --trimpath ./cmd/pebble',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-w',
        '-s',
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
      'pebble version | grep \'client  v{{version}}\'',
      'test "$(pebble version --client)" = v{{version}}',
    ],
  },
}
