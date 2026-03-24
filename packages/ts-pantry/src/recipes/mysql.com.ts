import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mysql.com',
  name: 'mysql',
  description: 'Open source relational database management system',
  homepage: 'http://www.mysql.com/',
  github: 'https://github.com/mysql/mysql-server',
  programs: ['mysql', 'mysqld', 'mysqladmin', 'mysqldump', 'mysql_config'],
  versionSource: {
    type: 'github-releases',
    repo: 'mysql/mysql-server',
  },

  build: {
    script: [
      'echo "Build from source — see GitHub for instructions"',
    ],
  },
}
