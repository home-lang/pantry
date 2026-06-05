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
  // Prebuilt download: swagger-codegen ships a runnable, fully-shaded
  // `swagger-codegen-cli-<ver>.jar` on Maven Central. The 2.4.x line lives at
  // `io/swagger/swagger-codegen-cli`, the 3.0.x line at
  // `io/swagger/codegen/v3/swagger-codegen-cli`. We download the published CLI
  // jar and drop a `java -jar` wrapper — the recipe already depends on a JRE
  // (openjdk.org), so no maven build from source is needed.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'MAJOR=$(echo "$VERSION" | cut -d. -f1)',
      'if [ "$MAJOR" -ge 3 ]; then',
      '  JAR_URL="https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/${VERSION}/swagger-codegen-cli-${VERSION}.jar"',
      'else',
      '  JAR_URL="https://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/${VERSION}/swagger-codegen-cli-${VERSION}.jar"',
      'fi',
      '',
      'mkdir -p {{prefix}}/libexec/lib {{prefix}}/bin',
      'curl -Lfo {{prefix}}/libexec/lib/swagger-codegen-cli.jar "$JAR_URL"',
      '',
      'echo \'#!/bin/sh\' > {{prefix}}/bin/swagger-codegen',
      'echo \'exec java -jar "$(dirname "$0")/../libexec/lib/swagger-codegen-cli.jar" "$@"\' >> {{prefix}}/bin/swagger-codegen',
      'chmod +x {{prefix}}/bin/swagger-codegen',
    ],
  },
  test: {
    script: [
      'swagger-codegen version | grep {{version}}',
    ],
  },
}
