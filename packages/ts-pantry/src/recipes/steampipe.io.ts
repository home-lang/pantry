import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'steampipe.io',
  name: 'steampipe',
  description: 'Zero-ETL, infinite possibilities. Live query APIs, code & more with SQL. No DB required.',
  homepage: 'https://steampipe.io/',
  github: 'https://github.com/turbot/steampipe',
  programs: ['steampipe'],
  versionSource: {
    type: 'github-releases',
    repo: 'turbot/steampipe',
  },
  distributable: {
    url: 'git+https://github.com/turbot/steampipe.git',
  },
  buildDependencies: {
    'go.dev': '^1.24',
    'goreleaser.com': '*',
    'git-scm.org': '2',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/steampipe\' .',
      'goreleaser build --clean --single-target --skip=validate',
      'install -Dm755 "dist/steampipe_${PLATFORM}/steampipe" "{{ prefix }}"/bin/steampipe',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/turbot/steampipe/pkg/version.steampipeVersion={{version}}'],
    },
  },
}
