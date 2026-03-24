import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'meilisearch.com',
  name: 'meilisearch',
  programs: ['meilisearch'],
  versionSource: {
    type: 'github-releases',
    repo: 'meilisearch/meilisearch',
    tagPattern: /\/^v\//,
  },
  distributable: null,

  build: {
    script: [
      'curl -L "$DIST" -o meilisearch',
      'chmod +x meilisearch',
      'mkdir -p "{{prefix}}/bin"',
      'mv meilisearch "{{prefix}}/bin/"',
    ],
  },
}
