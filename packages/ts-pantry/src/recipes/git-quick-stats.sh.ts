import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'git-quick-stats.sh',
  name: 'git-quick-stats',
  description: '▁▅▆▃▅ Git quick statistics is a simple and efficient way to access various statistics in git repository.',
  homepage: 'https://git-quick-stats.sh/',
  github: 'https://github.com/arzzen/git-quick-stats',
  programs: ['', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'arzzen/git-quick-stats',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/arzzen/git-quick-stats/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'git clone https://github.com/pkgxdev/pkgx',
      'git -C pkgx quick-stats -T',
    ],
  },
}
