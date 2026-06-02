import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'thrysoee.dk/editline',
  name: 'editline',
  description: 'Port of the NetBSD editline library (libedit)',
  homepage: 'https://thrysoee.dk/editline/',
  programs: [],
  versionSource: {
    type: 'url-pattern',
    url: 'https://thrysoee.dk/editline/libedit-20221030-{{version}}.tar.gz',
    knownVersions: ['3.1'],
  },
  distributable: {
    // The date prefix (20221030) pairs with the 3.1 release tarball upstream.
    url: 'https://thrysoee.dk/editline/libedit-20221030-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'invisible-island.net/ncurses': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--prefix={{prefix}}',
      ],
    },
  },
}
