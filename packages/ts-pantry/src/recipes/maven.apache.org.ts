import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'maven.apache.org',
  name: 'mvn',
  description: 'Java-based project management',
  homepage: 'https://maven.apache.org/',
  github: 'https://github.com/apache/maven',
  programs: ['mvn', 'mvnDebug', 'mvnyjp'],
  versionSource: {
    type: 'github-releases',
    repo: 'apache/maven/tags',
    tagPattern: /\/^maven-\//,
  },
  distributable: {
    url: 'https://archive.apache.org/dist/maven/maven-{{version.major}}/{{version}}/binaries/apache-maven-{{version}}-bin.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openjdk.org': '*',
  },

  build: {
    script: [
      'rm bin/*.cmd',
      'mkdir -p {{prefix}}',
      'mv ./* {{prefix}}/',
    ],
  },
}
