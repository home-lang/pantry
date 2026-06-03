import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'swagger.io/swagger-codegen',
  name: 'swagger-codegen',
  programs: [
    'swagger-codegen',
  ],
  dependencies: {
    'openjdk.org': '^11',
  },
  buildDependencies: {
    'maven.apache.org': '*',
  },
  distributable: {
    url: 'https://github.com/swagger-api/swagger-codegen/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'find . -name pom.xml -print0 | xargs -0 sed -i \'s/<version>{{version.major}}\\.{{version.minor}}.*-SNAPSHOT<\\/version>/<version>{{version}}<\\/version>/\'',
      'find . -name pom.xml -print0 | xargs -0 sed -i \'s/1\\.0\\.58-SNAPSHOT/1.0.57/g\'',
      'mvn clean package -U',
      'install -D modules/swagger-codegen-cli/target/swagger-codegen-cli.jar {{prefix}}/libexec/lib/swagger-codegen-cli.jar',
      {
        run: 'install -Dm755 $PROP swagger-codegen',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
  test: {
    script: [
      'swagger-codegen generate -i $FIXTURE -l html',
      'swagger-codegen generate -i $FIXTURE -l html',
      'cat index.html | grep "Simple API"',
      'swagger-codegen version',
      'swagger-codegen version | grep {{version}}',
    ],
  },
}
