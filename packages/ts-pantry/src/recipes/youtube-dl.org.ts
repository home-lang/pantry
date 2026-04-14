import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'youtube-dl.org',
  name: 'youtube-dl',
  description: 'Command-line program to download videos from YouTube.com and other video sites',
  homepage: 'https://ytdl-org.github.io/youtube-dl/',
  github: 'https://github.com/ytdl-org/youtube-dl',
  programs: ['youtube-dl'],
  versionSource: {
    type: 'github-releases',
    repo: 'ytdl-org/youtube-dl',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/ytdl-org/youtube-dl/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for youtube-dl.org"',    ],
  },
}
