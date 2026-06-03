import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freedesktop.org/libbsd',
  name: 'libbsd',
  programs: [],
  platforms: ['linux'],
  buildDependencies: {
    'hadrons.org/libmd': '*',
  },
  distributable: {
    url: 'https://libbsd.freedesktop.org/releases/libbsd-{{version}}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      linux: {
        CFLAGS: '$CFLAGS -Wl,--undefined-version',
      },
    },
  },
  test: {
    script: [
      'nm {{prefix}}/lib/libbsd.so.{{version.major}} | grep strtonum',
    ],
  },
}
