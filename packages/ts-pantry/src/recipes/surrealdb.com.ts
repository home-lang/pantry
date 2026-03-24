import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'surrealdb.com',
  name: 'surreal',
  description: 'A scalable, distributed, collaborative, document-graph database, for the realtime web',
  homepage: 'https://surrealdb.com',
  github: 'https://github.com/surrealdb/surrealdb',
  programs: ['surreal'],
  versionSource: {
    type: 'github-releases',
    repo: 'surrealdb/surrealdb',
  },
  distributable: {
    url: 'https://github.com/surrealdb/surrealdb/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'if test "{{hw.platform}}" = "darwin"; then',
      '  if test "{{hw.arch}}" = "aarch64"; then SUFFIX="darwin-arm64"',
      '  else SUFFIX="darwin-amd64"; fi',
      'else',
      '  if test "{{hw.arch}}" = "aarch64"; then SUFFIX="linux-arm64"',
      '  else SUFFIX="linux-amd64"; fi',
      'fi',
      'URL="https://github.com/surrealdb/surrealdb/releases/download/v{{version}}/surreal-v{{version}}.${SUFFIX}.tgz"',
      'echo "Downloading SurrealDB from: $URL"',
      'mkdir -p "{{prefix}}/bin"',
      'curl -fSL "$URL" | tar -xz -C "{{prefix}}/bin"',
    ],
  },
}
