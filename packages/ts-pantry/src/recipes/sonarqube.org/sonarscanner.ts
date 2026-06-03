import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "sonarqube.org/sonarscanner",
  name: "sonarscanner",
  programs: [
    "sonar-scanner",
    "sonar-scanner-debug",
  ],
  dependencies: {
    'openjdk.org': "^21",
  },
  distributable: {
    url: "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-{{version.tag}}.zip",
  },
  build: {
    script: [
      "rm -rf bin/*.bat",
      {
        run: "mkdir -p bin libexec",
        'working-directory': "${{prefix}}",
      },
      "cp -r ./* {{prefix}}/libexec/",
      {
        run: "ln -s ../libexec/bin/sonar-scanner sonar-scanner\nln -s ../libexec/bin/sonar-scanner-debug sonar-scanner-debug\n",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "sonar-scanner --version | grep {{version}}",
    ],
  },
}
