import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'markupsafe.palletsprojects.com',
  name: 'markupsafe.palletsprojects',
  description: 'Safely add untrusted strings to HTML/XML markup.',
  homepage: 'https://markupsafe.palletsprojects.com',
  github: 'https://github.com/pallets/markupsafe',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'pallets/markupsafe',
  },
  distributable: {
    url: 'https://github.com/pallets/markupsafe/releases/download/{{version}}/MarkupSafe-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python -m pip install . --prefix="{{prefix}}"',
    ],
  },
}
