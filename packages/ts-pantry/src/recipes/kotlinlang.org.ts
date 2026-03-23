import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'kotlinlang.org',
  name: 'kotlinlang',
  description: 'Statically typed programming language for the JVM',
  homepage: 'https://kotlinlang.org/',
  github: 'https://github.com/JetBrains/kotlin',
  programs: ['kapt', 'kotlin', 'kotlinc', 'kotlinc-js', 'kotlinc-jvm'],
  versionSource: {
    type: 'github-releases',
    repo: 'JetBrains/kotlin',
  },
  distributable: {
    url: 'https://github.com/JetBrains/kotlin/releases/download/{{version.tag}}/kotlin-compiler-{{version}}.zip',
    stripComponents: 1,
  },
  dependencies: {
    'openjdk.org': '*',
  },

  build: {
    script: [
      'echo -e "{{version}}" > build.txt',
      'mkdir -p {{prefix}}/bin',
      'install bin/* {{prefix}}/bin/',
      'mkdir -p {{prefix}}/lib',
      'install lib/* {{prefix}}/lib/',
      'install build.txt {{prefix}}/',
      'rm {{prefix}}/bin/*.bat',
    ],
  },
}
