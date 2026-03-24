import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'ghostscript.com',
  name: 'ghostscript',
  description: 'This is purely for downloads, please check the website for full information',
  homepage: 'https://www.ghostscript.com/',
  github: 'https://github.com/ArtifexSoftware/ghostpdl-downloads',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'ArtifexSoftware/ghostpdl-downloads',
  },

  build: {
    script: [
      'echo "Build from source — see GitHub for instructions"',
    ],
  },
}
