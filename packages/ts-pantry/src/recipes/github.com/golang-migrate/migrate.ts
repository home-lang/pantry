import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/golang-migrate/migrate',
  name: 'migrate',
  programs: [
    'migrate',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/golang-migrate/migrate/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -tags "$DATABASE $SOURCE" -o $BUILDLOC ./cmd/migrate',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/migrate',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
      SOURCE: [
        'file',
        'go_bindata',
        'github',
        'github_ee',
        'bitbucket',
        'aws_s3',
        'google_cloud_storage',
        'godoc_vfs',
        'gitlab',
      ],
      DATABASE: [
        'postgres',
        'mysql',
        'redshift',
        'cassandra',
        'spanner',
        'cockroachdb',
        'yugabytedb',
        'clickhouse',
        'mongodb',
        'sqlserver',
        'firebird',
        'neo4j',
        'pgx',
        'pgx5',
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
      'test $(migrate -version 2>&1) = {{version}}',
    ],
  },
}
