import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'openjdk.org',
  name: 'openjdk',
  description: 'Development kit for the Java programming language',
  homepage: 'https://openjdk.java.net/',
  programs: ['jar', 'jarsigner', 'java', 'javac', 'javadoc', 'javap', 'jcmd', 'jconsole', 'jdb', 'jdeprscan', 'jdeps', 'jfr', 'jhsdb', 'jimage', 'jinfo', 'jlink', 'jmap', 'jmod', 'jps', 'jrunscript', 'jshell', 'jstack', 'jstat', 'jstatd', 'keytool', 'rmiregistry', 'serialver'],

  build: {
    script: [
      '# Download pre-built Adoptium Temurin JDK via API',
      'MAJOR=$(echo "{{version}}" | cut -d. -f1)',
      '',
      'if test "{{hw.platform}}" = "darwin"; then',
      '  API_ARCH="{{hw.arch}}"',
      '  test "$API_ARCH" = "aarch64" || API_ARCH="x64"',
      '  API_OS="mac"',
      '  STRIP=3',
      'else',
      '  API_ARCH="{{hw.arch}}"',
      '  test "$API_ARCH" = "x86-64" && API_ARCH="x64"',
      '  API_OS="linux"',
      '  STRIP=1',
      'fi',
      '',
      '# Query Adoptium API for the latest GA release binary URL',
      'API_URL="https://api.adoptium.net/v3/binary/latest/${MAJOR}/ga/${API_OS}/${API_ARCH}/jdk/hotspot/normal/eclipse"',
      'echo "Fetching from Adoptium API: $API_URL"',
      'curl -fSL -o temurin-jdk.tar.gz "$API_URL"',
      'tar xzf temurin-jdk.tar.gz --strip-components=$STRIP -C "{{prefix}}"',
      'rm -f temurin-jdk.tar.gz',
    ],
    skip: ['fix-machos', 'fix-patchelf'],
  },
}
