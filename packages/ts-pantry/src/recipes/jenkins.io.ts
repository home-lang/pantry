import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jenkins.io',
  name: 'jenkins-lts',
  description: 'Extendable open source continuous integration server',
  homepage: 'https://www.jenkins.io/',
  programs: ['jenkins-lts', 'jenkins-lts-cli'],
  distributable: {
    url: 'https://get.jenkins.io/war-stable/{{version}}/jenkins.war',
  },
  dependencies: {
    'openjdk.org': '<20',
  },

  build: {
    script: [
      'cd "${{prefix}}"',
      'mkdir -p libexec/lib bin var/jenkins',
      'jar xvf jenkins.io-{{version}}.war',
      'cp -r jenkins.io-{{version}}.war {{prefix}}/libexec/lib/',
      'cp -r WEB-INF/lib/* {{prefix}}/libexec/lib/',
      'cd "${{prefix}}/bin"',
      'cat > jenkins-lts <<EOF',
      '#!/bin/sh',
      'exec java -jar \\$(dirname \\$0)/../libexec/lib/jenkins.io-{{version}}.war "\\$@"',
      'EOF',
      'chmod +x jenkins-lts',
      '',
      'cd "${{prefix}}/bin"',
      'cat > jenkins-lts-cli <<EOF',
      '#!/bin/sh',
      'exec java -jar \\$(dirname \\$0)/../libexec/lib/cli-{{version}}.jar "\\$@"',
      'EOF',
      'chmod +x jenkins-lts-cli',
      '',
    ],
  },
}
