import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'duckdb.org',
  name: 'duckdb',
  description: 'DuckDB is an analytical in-process SQL database management system',
  homepage: 'https://www.duckdb.org',
  github: 'https://github.com/duckdb/duckdb',
  programs: ['duckdb'],
  versionSource: {
    type: 'github-releases',
    repo: 'duckdb/duckdb',
  },
  distributable: {
    url: 'https://github.com/duckdb/duckdb/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '^3',
    'git-scm.org': '*',
    'python.org': '^3',
  },

  build: {
    script: [
      'git init ..',
      'git config user.email "bot@pkgx.dev"',
      'git config user.name "pkgxbot"',
      'git commit --allow-empty -mnil',
      'git tag v{{version}}',
      'cmake ..',
      'make --jobs {{ hw.concurrency }}',
      'mkdir -p "{{prefix}}"/bin',
      'mv duckdb "{{prefix}}"/bin',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DBUILD_ICU_EXTENSION=1', '-DBUILD_JSON_EXTENSION=1', '-DBUILD_PARQUET_EXTENSION=1'],
    },
  },
}
