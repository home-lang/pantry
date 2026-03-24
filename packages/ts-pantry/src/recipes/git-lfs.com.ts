import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-lfs.com',
  name: 'git-lfs',
  description: 'Git extension for versioning large files',
  homepage: 'https://git-lfs.github.com/',
  github: 'https://github.com/git-lfs/git-lfs',
  programs: ['git-lfs'],
  versionSource: {
    type: 'github-releases',
    repo: 'git-lfs/git-lfs',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/git-lfs/git-lfs/releases/download/v{{version}}/git-lfs-v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'wget $DOWNLOAD_URL',
      '$UNARCHIVE',
      'cd git-lfs-{{version}}',
      'mkdir -p {{prefix}}/bin',
      'install ./git-lfs {{prefix}}/bin/git-lfs',
      'mkdir -p {{prefix}}/man',
      'mv ./man/* {{prefix}}/man/',
    ],
  },
}
