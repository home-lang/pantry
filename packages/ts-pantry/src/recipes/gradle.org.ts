import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gradle.org',
  name: 'gradle',
  description: 'Open-source build automation tool based on the Groovy and Kotlin DSL',
  homepage: 'https://www.gradle.org/',
  programs: ['gradle'],
  distributable: {
    url: 'https://services.gradle.org/distributions/gradle-{{version.raw}}-all.zip',
  },
  dependencies: {
    'openjdk.org': '*',
  },

  build: {
    script: [
      'find bin -name \\*.bat -exec rm {} \\;',
      'mkdir -p {{prefix}}',
      'cp -a bin docs lib src {{prefix}}/',
    ],
  },
}
