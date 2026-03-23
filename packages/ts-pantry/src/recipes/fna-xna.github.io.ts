import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'fna-xna.github.io',
  name: 'fna-xna.github',
  description: 'FAudio - Accuracy-focused XAudio reimplementation for open platforms',
  homepage: 'https://fna-xna.github.io/',
  github: 'https://github.com/FNA-XNA/FAudio',
  programs: ['', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'FNA-XNA/FAudio',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/FNA-XNA/FAudio.git',
  },

  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
  },
}
