import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jenkins.io',
  name: 'jenkins-lts',
  description: 'Extendable open source continuous integration server',
  homepage: 'https://www.jenkins.io/',
  programs: ['jenkins-lts', 'jenkins-lts-cli'],
  distributable: {
    // war-stable hosts every Jenkins LTS .war; the download is saved by buildkit
    // as `jenkins.io-{{version}}.war` (non-archive single file, not extracted).
    url: 'https://get.jenkins.io/war-stable/{{version}}/jenkins.war',
  },
  dependencies: {
    // openjdk provides both the runtime `java` and the build-time `jar` tool.
    'openjdk.org': '<20',
  },

  build: {
    script: [
      // Lay out the install tree inside the prefix.
      {
        run: 'mkdir -p libexec/lib bin var/jenkins',
        'working-directory': '{{prefix}}',
      },
      // The remaining extract/copy steps run in the build dir, where the .war
      // was downloaded (buildkit names it jenkins.io-{{version}}.war).
      'jar xvf jenkins.io-{{version}}.war',
      'cp -r jenkins.io-{{version}}.war {{prefix}}/libexec/lib/',
      'cp -r WEB-INF/lib/* {{prefix}}/libexec/lib/',
      // Launcher for the Jenkins server.
      {
        run: [
          'cat > jenkins-lts <<EOF',
          '#!/bin/sh',
          'exec java -jar \\$(dirname \\$0)/../libexec/lib/jenkins.io-{{version}}.war "\\$@"',
          'EOF',
          'chmod +x jenkins-lts',
        ],
        'working-directory': '{{prefix}}/bin',
      },
      // Launcher for the Jenkins CLI (cli-{{version}}.jar ships inside WEB-INF/lib).
      {
        run: [
          'cat > jenkins-lts-cli <<EOF',
          '#!/bin/sh',
          'exec java -jar \\$(dirname \\$0)/../libexec/lib/cli-{{version}}.jar "\\$@"',
          'EOF',
          'chmod +x jenkins-lts-cli',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
  },
}
