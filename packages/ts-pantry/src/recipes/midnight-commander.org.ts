import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'midnight-commander.org',
  name: 'Midnight Commander',
  description: 'Terminal-based visual file manager',
  homepage: 'https://www.midnight-commander.org/',
  github: 'https://github.com/MidnightCommander/mc',
  programs: ['mc', 'mcdiff', 'mcedit', 'mcview'],
  versionSource: {
    type: 'github-releases',
    repo: 'MidnightCommander/mc',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://ftp.midnight-commander.org/mc-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'mc --datadir',
      'test "$(mc --datadir | cut -d \\ \\ -f1 | cut -d\\:\\ -f1)" = "{{prefix}}/etc/mc/"',
    ],
  },
}
