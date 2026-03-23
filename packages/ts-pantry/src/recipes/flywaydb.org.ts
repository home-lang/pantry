import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'flywaydb.org',
  name: 'flyway',
  description: 'Database version control to control migrations',
  homepage: 'https://flywaydb.org/',
  programs: ['flyway'],
  distributable: null,
  dependencies: {
    'openjdk.org': '^21',
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'URL=\'https://search.maven.org/remotecontent?filepath=org/flywaydb/flyway-commandline/{{version.raw}}/flyway-commandline-{{version.raw}}.tar.gz\'',
      'URL=\'https://github.com/flyway/flyway/releases/download/flyway-{{version.raw}}/flyway-commandline-{{version.raw}}.tar.gz\'',
      'curl -L "$URL" | tar xz',
      'mkdir -p {{prefix}}/libexec',
      'cp -r ./flyway-{{version}}/* {{prefix}}/libexec/',
      'cd "${{prefix}}/bin"',
      'ln -s ../libexec/flyway flyway',
    ],
  },
}
