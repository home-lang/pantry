import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
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
      {
        run: 'URL=\'https://search.maven.org/remotecontent?filepath=org/flywaydb/flyway-commandline/{{version.raw}}/flyway-commandline-{{version.raw}}.tar.gz\'',
        if: '<11.11',
      },
      'URL=\'https://github.com/flyway/flyway/releases/download/flyway-{{version.raw}}/flyway-commandline-{{version.raw}}.tar.gz\'',
      'curl -L "$URL" | tar xz',
      'mkdir -p {{prefix}}/libexec',
      'cp -r ./flyway-{{version}}/* {{prefix}}/libexec/',
      {
        run: 'ln -s ../libexec/flyway flyway',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
}
