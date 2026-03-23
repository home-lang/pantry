import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pixman.org',
  name: 'pixman',
  github: 'https://github.com/freedesktop/pixman',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'freedesktop/pixman/tags',
    tagPattern: /\/^pixman-\//,
  },
  distributable: {
    url: 'https://cairographics.org/releases/pixman-{{ version }}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{ prefix }} --disable-debug',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      '',
    ],
  },
}
