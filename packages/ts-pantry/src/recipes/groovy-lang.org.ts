import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'groovy-lang.org',
  name: 'groovy-lang',
  description: '',
  programs: [],
  distributable: {
    url: 'https://groovy.jfrog.io/artifactory/dist-release-local/groovy-zips/apache-groovy-binary-{{version}}.zip',
  },

  build: {
    script: [
      'find bin -name \\*.bat\\ -exec rm {} \\;',
      'mkdir -p "{{prefix}}"',
      'run: dos2unix * || true',
      'cp -a bin conf lib "{{prefix}}"',
    ],
  },
}
