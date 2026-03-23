import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'babashka.org',
  name: 'babashka',
  programs: ['bb'],
  versionSource: {
    type: 'github-releases',
    repo: 'babashka/babashka',
  },
  distributable: null,

  build: {
    script: [
      'curl -L "${BASE_URL}/${FILENAME_PREFIX}${PLATFORM}-${ARCH}${SUFFIX}.tar.gz" | tar zxvf -',
      'install -Dm755 bb {{prefix}}/bin/bb',
    ],
    env: {
      'BASE_URL': 'https://github.com/babashka/babashka/releases/download/{{version.tag}}',
      'FILENAME_PREFIX': 'babashka-{{version}}-',
    },
  },
}
