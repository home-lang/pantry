import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cnquery.io',
  name: 'cnquery',
  description: 'open source, cloud-native, graph-based asset inventory',
  homepage: 'https://cnquery.io',
  github: 'https://github.com/mondoohq/mql',
  programs: ['cnquery', 'mql'],
  versionSource: {
    type: 'github-releases',
    repo: 'mondoohq/mql',
  },
  distributable: {
    // repo mondoohq/cnquery was renamed to mondoohq/mql
    url: 'https://github.com/mondoohq/mql/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.25.6', // as of v13
  },

  build: {
    script: [
      {
        run: [
          'go build $ARGS -o={{prefix}}/bin/cnquery -ldflags="$GO_LDFLAGS" ./apps/cnquery/cnquery.go',
          'ln -s cnquery {{prefix}}/bin/mql',
        ],
        if: '<13',
      },
      {
        run: [
          'go build $ARGS -o={{prefix}}/bin/mql -ldflags="$GO_LDFLAGS" ./apps/mql/mql.go',
          'ln -s mql {{prefix}}/bin/cnquery',
        ],
        if: '>=13',
      },
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X go.mondoo.com/mql/v13.Version={{version}}',
        '-X go.mondoo.com/mql/v13.Build=pkgx',
        '-X go.mondoo.com/mql/v13.Date=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
      ],
      linux: {
        GO_LDFLAGS: ['-buildmode=pie'],
      },
      ARGS: ['-v', '-trimpath'],
    },
  },
}
