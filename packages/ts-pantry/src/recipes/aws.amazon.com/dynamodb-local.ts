import type { Recipe } from '../../../scripts/recipe-types'
import { mavenVersions } from '../../../scripts/maven-versions'

export const recipe: Recipe = {
  domain: 'aws.amazon.com/dynamodb-local',
  name: 'dynamodb-local',
  description: 'Amazon DynamoDB Local for development and integration tests',
  homepage: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html',
  programs: ['dynamodb-local'],
  // The upstream sqlite4java dependency supplies this native Linux library.
  // Other platforms need their own real native acceptance before registration.
  platforms: ['linux/x86-64'],
  dependencies: { 'openjdk.org': '>=17' },
  buildDependencies: { 'maven.apache.org': '^3', 'bun.sh': '>=1.3' },
  versionSource: {
    type: 'custom',
    fetch: async () => (await mavenVersions('software.amazon.dynamodb', 'DynamoDBLocal')).filter(version => Number(version.split('.')[0]) >= 3),
  },
  distributable: null,
  propsDir: '../props/aws.amazon.com/dynamodb-local',
  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'mkdir -p "{{prefix}}/bin" "{{prefix}}/libexec"',
      // Maven resolves the immutable upstream POM, including runtime jars and
      // sqlite4java's native libraries. No mutable "latest" archive is involved.
      [
        'cat > pom.xml <<\'POM\'',
        '<project xmlns="http://maven.apache.org/POM/4.0.0">',
        '  <modelVersion>4.0.0</modelVersion>',
        '  <groupId>org.stacksjs.pantry</groupId><artifactId>dynamodb-local-runtime</artifactId><version>1</version>',
        '  <dependencies><dependency>',
        '    <groupId>software.amazon.dynamodb</groupId><artifactId>DynamoDBLocal</artifactId><version>{{version}}</version>',
        '  </dependency></dependencies>',
        '</project>',
        'POM',
      ].join('\n'),
      'mvn --batch-mode --no-transfer-progress -Dmaven.repo.local="{{srcroot}}/maven-cache" org.apache.maven.plugins:maven-dependency-plugin:3.11.0:copy-dependencies -DincludeScope=runtime -Dmdep.stripVersion=true -DoutputDirectory="{{prefix}}/libexec"',
      [
        'cat > "{{prefix}}/bin/dynamodb-local" <<\'SH\'',
        '#!/bin/sh',
        'set -eu',
        'runtime_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../libexec" && pwd)',
        'exec java "-Djava.library.path=$runtime_dir" -cp "$runtime_dir/*" software.amazon.dynamodb.services.local.main.ServerRunner "$@"',
        'SH',
        'chmod +x "{{prefix}}/bin/dynamodb-local"',
      ].join('\n'),
    ],
  },
  test: {
    required: true,
    script: ['bun "{{srcroot}}/props/health.ts" "{{prefix}}/bin/dynamodb-local" "{{version}}"'],
  },
}
