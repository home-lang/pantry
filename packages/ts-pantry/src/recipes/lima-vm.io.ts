import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'lima-vm.io',
  name: 'lima-vm',
  description: 'Linux virtual machines, with a focus on running containers',
  homepage: 'https://lima-vm.io/',
  github: 'https://github.com/lima-vm/lima',
  programs: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'lima-vm/lima',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/lima-vm/lima/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run:',
      'make $ARGS binaries',
      'mkdir -p {{prefix}}',
      'mv ./_output/* {{prefix}}/',
    ],
  },
}
