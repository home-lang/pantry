import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'youtube-dl.org',
  name: 'youtube-dl',
  description: 'Command-line program to download videos from YouTube.com and other video sites',
  homepage: 'https://ytdl-org.github.io/youtube-dl/',
  github: 'https://github.com/ytdl-org/youtube-dl',
  programs: ['youtube-dl'],
  // Upstream repo is no longer active; pkgx pins a specific master commit
  // (86e3cf5e58) released as 2023.08.04 to capture an important fix.
  versionSource: {
    type: 'custom',
    fetch: async () => ['2023.08.04'],
  },
  distributable: {
    url: 'https://github.com/ytdl-org/youtube-dl/archive/86e3cf5e58.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3<3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/youtube-dl',
    ],
  },
}
