import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'midnight-commander.org',
  name: 'Midnight Commander',
  description: 'Terminal-based visual file manager',
  homepage: 'https://www.midnight-commander.org/',
  github: 'https://github.com/MidnightCommander/mc',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'MidnightCommander/mc',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'http://ftp.midnight-commander.org/mc-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'mc --datadir',
      'test "$(mc --datadir | cut -d \\ \\ -f1 | cut -d\\:\\ -f1)" = "{{prefix}}/etc/mc/"',
    ],
  },
}
