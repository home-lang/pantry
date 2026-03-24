import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'yt-dlp.org',
  name: 'yt-dlp',
  description: 'A feature-rich command-line audio/video downloader',
  homepage: 'https://discord.gg/H5MNcFW63r',
  github: 'https://github.com/yt-dlp/yt-dlp',
  programs: ['yt-dlp'],
  versionSource: {
    type: 'github-releases',
    repo: 'yt-dlp/yt-dlp',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/yt-dlp/yt-dlp/releases/download/{{version.raw}}/yt-dlp.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for yt-dlp.org"',    ],
  },
}
