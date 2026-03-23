import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'alembic.sqlalchemy.org',
  name: 'alembic',
  description: 'A database migrations tool for SQLAlchemy.',
  homepage: '',
  github: 'https://github.com/sqlalchemy/alembic',
  programs: ['alembic'],
  versionSource: {
    type: 'github-releases',
    repo: 'sqlalchemy/alembic',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
    'VER_UNDERSCORE=$(echo "{{version}}" | tr "." "_")',
    'TAG="rel_${VER_UNDERSCORE}"',
    'curl -fSL "https://github.com/sqlalchemy/alembic/archive/refs/tags/${TAG}.tar.gz" | tar xz --strip-components=1',
    'echo placeholder',
    ],
  },
}
