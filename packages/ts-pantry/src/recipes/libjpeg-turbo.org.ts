import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libjpeg-turbo.org',
  name: 'libjpeg-turbo',
  description: 'Main libjpeg-turbo repository',
  homepage: 'https://libjpeg-turbo.org',
  github: 'https://github.com/libjpeg-turbo/libjpeg-turbo',
  programs: ['cjpeg', 'djpeg', 'jpegtran', 'rdjpgcom', 'tjbench', 'wrjpgcom'],
  versionSource: {
    type: 'github-releases',
    repo: 'libjpeg-turbo/libjpeg-turbo',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/libjpeg-turbo/libjpeg-turbo/releases/download/{{version.tag}}/libjpeg-turbo-{{version.tag}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
