import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'plantuml.com',
  name: 'plantuml',
  description: 'Generate diagrams from textual description',
  homepage: 'https://plantuml.com/',
  github: 'https://github.com/plantuml/plantuml',
  programs: ['plantuml'],
  versionSource: {
    type: 'github-releases',
    repo: 'plantuml/plantuml',
  },
  distributable: {
    url: 'https://github.com/plantuml/plantuml/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'graphviz.org': '*',
    'openjdk.org': '*',
  },
  buildDependencies: {
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      'wget https://github.com/plantuml/plantuml/releases/download/v{{version}}/plantuml-{{version}}.jar',
      'mkdir -p {{prefix}}/libexec',
      'install plantuml-{{version}}.jar {{prefix}}/libexec/',
      'cat <<EOS > plantuml',
      '#!/bin/bash',
      'if [[ "\\$*" != *"-gui"* ]]; then',
      '  VMARGS="-Djava.awt.headless=true"',
      'fi',
      'GRAPHVIZ_DOT="\\$DOT_BIN" exec "\\$JAVA_BIN" \\$VMARGS -jar "\\$PLANTUML_JAR" "\\$@"',
      'EOS',
      '',
      'mkdir -p {{prefix}}/bin',
      'install plantuml {{prefix}}/bin/plantuml',
    ],
  },
}
