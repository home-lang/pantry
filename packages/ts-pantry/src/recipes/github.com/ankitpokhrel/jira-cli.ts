import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ankitpokhrel/jira-cli',
  name: 'jira-cli',
  programs: [
    'jira',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/ankitpokhrel/jira-cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'unset LDFLAGS',
        if: 'darwin',
      },
      'make deps install',
    ],
    env: {
      GOBIN: '${{prefix}}/bin',
      VERSION: '${{version}}',
      GIT_COMMIT: 'release',
      SOURCE_DATE_EPOCH: '$(date +%s)',
      linux: {
        LDFLAGS: '-buildmode=pie',
      },
    },
  },
  test: {
    script: [
      'jira version | grep \'Version={{version}}\'',
      '(jira serverinfo 2>&1 || true) | grep \'The tool needs a Jira API token to function.\'',
    ],
  },
}
