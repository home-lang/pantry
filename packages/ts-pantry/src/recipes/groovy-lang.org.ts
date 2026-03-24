import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'groovy-lang.org',
  name: 'groovy-lang',
  description: '',
  programs: ['grape', 'grape_completion', 'groovy', 'groovyc', 'groovyc_completion', 'groovy_completion', 'groovyConsole', 'groovyConsole_completion', 'groovydoc', 'groovydoc_completion', 'groovysh', 'groovysh_completion', 'java2groovy', 'startGroovy'],
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
