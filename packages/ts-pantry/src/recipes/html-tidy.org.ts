import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'html-tidy.org',
  name: 'tidy',
  description: 'The granddaddy of HTML tools, with support for modern standards',
  homepage: 'https://www.html-tidy.org/',
  github: 'https://github.com/htacg/tidy-html5',
  programs: ['tidy'],
  versionSource: {
    type: 'github-releases',
    repo: 'htacg/tidy-html5',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/htacg/tidy-html5/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'cd build/cmake',
      'cmake ../.. -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
