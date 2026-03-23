import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'bitwarden.com',
  name: 'bw',
  description: 'Secure and free password manager for all of your devices',
  homepage: 'https://bitwarden.com/',
  programs: ['bw'],
  platforms: ['darwin'],
  distributable: {
    url: 'https://placeholder.example.com/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'true',
    ],
  },
}
