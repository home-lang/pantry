import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'opencore-amr.sourceforge.io',
  name: 'opencore-amr.sourceforge',
  description: '',
  programs: ['', ''],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/opencore-amr/opencore-amr/opencore-amr-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for opencore-amr.sourceforge.io"',    ],
  },
}
