import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tailwindcss.com',
  name: 'tailwindcss',
  description: 'A utility-first CSS framework for rapid UI development.',
  homepage: 'https://tailwindcss.com',
  github: 'https://github.com/tailwindlabs/tailwindcss',
  programs: ['tailwindcss'],
  versionSource: {
    type: 'github-releases',
    repo: 'tailwindlabs/tailwindcss',
  },
  distributable: null,
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'curl -Lfo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/download/v{{version}}/tailwindcss-$PLATFORM',
      'chmod +x tailwindcss',
      'mkdir -p bin',
      'mv tailwindcss bin',
    ],
    skip: ['fix-patchelf'],
  },
}
