import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-quick-stats.sh',
  name: 'git-quick-stats',
  description: '▁▅▆▃▅ Git quick statistics is a simple and efficient way to access various statistics in git repository.',
  homepage: 'https://git-quick-stats.sh/',
  github: 'https://github.com/arzzen/git-quick-stats',
  programs: ['git-quick-stats'],
  dependencies: {
    'git-scm.org': '*',
    'gnu.org/bash': '*',
    // requires GNU `date` since 2.5.5
    'gnu.org/coreutils': '*',
    // needs `tput` since 2.7.0
    'invisible-island.net/ncurses': '~6.4.0',
    linux: {
      // bin/column
      'github.com/util-linux/util-linux': '*',
    },
  },
  versionSource: {
    type: 'github-tags',
    repo: 'arzzen/git-quick-stats',
    // tags are bare version numbers, e.g. 2.5.7
    tagPattern: /^(\d.+)$/,
  },
  distributable: {
    url: 'https://github.com/arzzen/git-quick-stats/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make PREFIX={{prefix}} install',
    ],
  },
}
