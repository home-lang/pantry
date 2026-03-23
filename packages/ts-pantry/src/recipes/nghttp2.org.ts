import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nghttp2.org',
  name: 'nghttp2',
  description: 'nghttp2 - HTTP/2 C Library and tools',
  homepage: 'https://nghttp2.org',
  github: 'https://github.com/nghttp2/nghttp2',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'nghttp2/nghttp2',
    tagPattern: /\/^nghttp2 v\//,
  },
  distributable: {
    url: 'https://github.com/nghttp2/nghttp2/releases/download/v{{ version }}/nghttp2-{{ version }}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{ prefix }}',
      'make -j {{ hw.concurrency }} -C lib install',
    ],
  },
}
